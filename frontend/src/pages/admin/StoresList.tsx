import { Plus, Trash2 } from 'lucide-react';
import { useState, useCallback } from 'react';
import { Button, StatusBadge } from '../../components/atoms';
import {
  ActionButtons,
  Modal,
  SearchInput,
  ToastNotification,
  TableToolbar,
  TablePagination,
  type ToastVariant,
} from '../../components/molecules';
import { StoreDetailsCard, StoreForm, DataTable } from '../../components/organisms';
import { storesService, type StoreApi } from '../../services/stores.service';
import { useCrud } from '../../hooks/useCrud';

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

interface NotificationState {
  id: number;
  title: string;
  message: string;
  variant: ToastVariant;
}

/**
 * Página: StoresListRefactored
 * Versión modularizada del listado de tiendas.
 * Utiliza componentes reutilizables y un hook personalizado para la lógica.
 */
export default function StoresListRefactored() {
  // ── Lógica Desacoplada (Hook useCrud) ────────────────────────────────────
  const fetchStores = useCallback(() => storesService.getStores(0, 1000), []);
  const deleteStore = useCallback((id: number) => storesService.deleteStore(id), []);

  const {
    items: stores,
    isLoading,
    errorMessage,
    pagination,
    refresh,
    remove,
  } = useCrud<StoreApi>(fetchStores, deleteStore);

  // ── Estados Locales de UI ────────────────────────────────────────────────
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<StoreApi | null>(null);
  const [storeToDelete, setStoreToDelete] = useState<StoreApi | null>(null);
  const [storeDetail, setStoreDetail] = useState<StoreApi | null>(null);
  const [notification, setNotification] = useState<NotificationState | null>(null);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const showNotification = useCallback((variant: ToastVariant, title: string, message: string) => {
    setNotification({ id: Date.now(), variant, title, message });
    setTimeout(() => setNotification(null), 3800);
  }, []);

  const handleStoreSuccess = (action: 'create' | 'update', store: StoreApi) => {
    void refresh();
    showNotification(
      'success',
      action === 'create' ? 'Tienda creada' : 'Tienda actualizada',
      `${store.store_name} guardada.`
    );
  };

  const confirmDelete = async () => {
    if (!storeToDelete) return;
    try {
      await remove(storeToDelete.id_store);
      showNotification(
        'success',
        'Tienda eliminada',
        `${storeToDelete.store_name} eliminada correctamente.`
      );
      setStoreToDelete(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'No se pudo eliminar.';
      showNotification('error', 'Error', message);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto h-full min-h-0 flex flex-col gap-4 overflow-hidden">
      {notification && (
        <ToastNotification
          {...notification}
          onClose={() => setNotification(null)}
          playSound
          soundUrl="/sounds/notification-chime.mp3"
        />
      )}

      {/* Cabecera */}
      <div className="flex items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tiendas Físicas</h1>
          <p className="mt-1 text-gray-500">Gestión de sucursales y puntos de venta.</p>
        </div>
        <Button icon={<Plus size={20} />} onClick={() => setIsCreateOpen(true)}>
          Nueva Tienda
        </Button>
      </div>

      {/* Buscador (Mockup) */}
      <div className="flex items-center justify-start gap-3 shrink-0">
        <SearchInput placeholder="Buscar tienda..." className="w-full md:w-96" />
      </div>

      {/* Contenedor de Tabla Modular */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-0">
        <TableToolbar
          pageSize={pagination.pageSize}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          onPageSizeChange={pagination.setPageSize}
          onRefresh={refresh}
          isLoading={isLoading}
        />

        {errorMessage && <div className="p-4 text-rose-700 bg-rose-50">{errorMessage}</div>}

        <DataTable
          columns={['ID', 'Nombre', 'Dirección', 'Estado', 'Acciones']}
          isLoading={isLoading}
          rowCount={stores.length}
          expectedRows={pagination.pageSize}
          emptyMessage="No hay tiendas registradas."
        >
          {stores.map((store, index) => (
            <tr
              key={store.id_store}
              onClick={() => setStoreDetail(store)}
              className={`h-12 hover:bg-gray-100 transition-colors border-b border-gray-50 cursor-pointer ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
            >
              <td className="px-3 py-0 align-middle truncate max-w-16">#{store.id_store}</td>
              <td className="px-3 py-0 align-middle font-medium text-gray-900 truncate max-w-48">
                {store.store_name}
              </td>
              <td className="px-3 py-0 align-middle truncate max-w-xs">{store.address}</td>
              <td className="px-3 py-0 align-middle">
                <StatusBadge status={store.status} />
              </td>
              <td className="px-3 py-0 align-middle" onClick={(e) => e.stopPropagation()}>
                <ActionButtons
                  onEdit={() => {
                    setSelectedStore(store);
                    setIsEditOpen(true);
                  }}
                  onDelete={() => setStoreToDelete(store)}
                />
              </td>
            </tr>
          ))}
        </DataTable>

        <TablePagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          pageSize={pagination.pageSize}
          onPageChange={pagination.setPage}
          isLoading={isLoading}
        />
      </div>

      {/* Modales */}
      <Modal
        isOpen={storeToDelete !== null}
        onClose={() => setStoreToDelete(null)}
        title="Eliminar tienda"
        size="sm"
      >
        <div className="p-6 flex flex-col gap-5">
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-rose-900">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-2xl bg-rose-100 p-2 text-rose-700">
                <Trash2 size={18} />
              </div>
              <div>
                <p className="font-semibold">¿Eliminar {storeToDelete?.store_name}?</p>
                <p className="mt-1 text-sm text-rose-800/90">Esta acción no se puede deshacer.</p>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setStoreToDelete(null)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={confirmDelete} icon={<Trash2 size={16} />}>
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={storeDetail !== null}
        onClose={() => setStoreDetail(null)}
        title="Detalle"
        size="lg"
      >
        <div className="p-6 bg-gray-50/70">
          <StoreDetailsCard store={storeDetail} />
          <div className="flex justify-end pt-4">
            <Button variant="ghost" onClick={() => setStoreDetail(null)}>
              Cerrar
            </Button>
          </div>
        </div>
      </Modal>

      <StoreForm
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        mode="create"
        onSuccess={handleStoreSuccess}
      />
      <StoreForm
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedStore(null);
        }}
        mode="edit"
        initialData={selectedStore}
        onSuccess={handleStoreSuccess}
      />
    </div>
  );
}
