import { Plus } from 'lucide-react';
import { useState, useCallback } from 'react';

// ── Átomos ──────────────────────────────────────────────────────────────────
import { Button, StatusBadge } from '../../components/atoms';

// ── Moléculas ───────────────────────────────────────────────────────────────
import {
  ActionButtons,
  TableToolbar,
  TablePagination,
  ConfirmDeleteModal,
  type ToastVariant,
} from '../../components/molecules';

// ── Organismos ──────────────────────────────────────────────────────────────
import { StoreForm, DataTable } from '../../components/organisms';

// ── Templates ───────────────────────────────────────────────────────────────
import { CrudPageTemplate } from '../../components/templates';

// ── Servicios y Hooks ───────────────────────────────────────────────────────
import { storesService, type StoreApi } from '../../services/stores.service';
import { useCrud } from '../../hooks/useCrud';

// ── Configuración ───────────────────────────────────────────────────────────
const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

interface NotificationState {
  id: number;
  title: string;
  message: string;
  variant: ToastVariant;
}

/**
 * Página: StoresList
 * Gestión modular de tiendas físicas con filtrado reactivo.
 */
export default function StoresList() {
  const [searchTerm, setSearchTerm] = useState('');

  // ── Lógica de Negocio (CRUD) ──────────────────────────────────────────────
  const fetchStores = useCallback(() => storesService.getStores(0, 1000), []);
  const deleteStore = useCallback((id: number) => storesService.deleteStore(id), []);

  const filterFn = useCallback(
    (store: StoreApi) => {
      const search = searchTerm.toLowerCase();
      return (
        store.store_name.toLowerCase().includes(search) ||
        store.address.toLowerCase().includes(search)
      );
    },
    [searchTerm]
  );

  const {
    items: stores,
    isLoading,
    errorMessage,
    pagination,
    refresh,
    remove,
  } = useCrud<StoreApi>(fetchStores, deleteStore, { filterFn });

  // ── Estados de Interfaz (UI) ──────────────────────────────────────────────
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<StoreApi | null>(null);
  const [storeToDelete, setStoreToDelete] = useState<StoreApi | null>(null);
  const [notification, setNotification] = useState<NotificationState | null>(null);

  // ── Manejadores de Eventos (Handlers) ────────────────────────────────────

  const showNotification = useCallback((variant: ToastVariant, title: string, message: string) => {
    setNotification({ id: Date.now(), variant, title, message });
    setTimeout(() => setNotification(null), 3800);
  }, []);

  const handleStoreSuccess = (action: 'create' | 'update', store: StoreApi) => {
    void refresh();
    showNotification(
      'success',
      action === 'create' ? 'Tienda creada' : 'Tienda actualizada',
      `${store.store_name} ha sido guardada correctamente.`
    );
  };

  const confirmDelete = async () => {
    if (!storeToDelete) return;
    try {
      await remove(storeToDelete.id_store);
      showNotification(
        'success',
        'Tienda eliminada',
        `${storeToDelete.store_name} ha sido eliminada del sistema.`
      );
      setStoreToDelete(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'No se pudo completar la operación.';
      showNotification('error', 'Error de Integridad', message);
    }
  };

  return (
    <CrudPageTemplate
      title="Tiendas Físicas"
      subtitle="Administra las sucursales, almacenes y puntos de venta del sistema."
      headerAction={
        <Button icon={<Plus size={20} />} onClick={() => setIsCreateOpen(true)}>
          Nueva Tienda
        </Button>
      }
      // Búsqueda
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      searchPlaceholder="Buscar por nombre o dirección..."
      // Notificaciones y Errores
      notification={notification}
      onNotificationClose={() => setNotification(null)}
      errorMessage={errorMessage}
      // Estructura de la Tabla
      tableToolbar={
        <TableToolbar
          pageSize={pagination.pageSize}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          onPageSizeChange={pagination.setPageSize}
          onRefresh={refresh}
          isLoading={isLoading}
        />
      }
      table={
        <DataTable
          columns={['ID', 'Nombre', 'Dirección', 'Estado', 'Acciones']}
          isLoading={isLoading}
          rowCount={stores.length}
          expectedRows={pagination.pageSize}
          emptyMessage="No se encontraron tiendas con los criterios actuales."
        >
          {stores.map((store, index) => (
            <tr
              key={store.id_store}
              onClick={() => {
                setSelectedStore(store);
                setIsViewOpen(true);
              }}
              className={`h-14 hover:bg-gray-100 transition-colors border-b border-gray-50 cursor-pointer ${
                index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
              }`}
            >
              <td className="px-3 py-0 align-middle text-gray-500">#{store.id_store}</td>
              <td className="px-3 py-0 align-middle font-medium text-gray-900">
                {store.store_name}
              </td>
              <td className="px-3 py-0 align-middle text-gray-600">{store.address}</td>
              <td className="px-3 py-0 align-middle">
                <StatusBadge status={store.status} />
              </td>
              <td className="px-3 py-0 align-middle">
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
      }
      tablePagination={
        <TablePagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          pageSize={pagination.pageSize}
          onPageChange={pagination.setPage}
          isLoading={isLoading}
        />
      }
    >
      <ConfirmDeleteModal
        isOpen={storeToDelete !== null}
        onClose={() => setStoreToDelete(null)}
        onConfirm={confirmDelete}
        title="Eliminar Tienda"
        itemName={storeToDelete?.store_name}
        isLoading={isLoading}
      />

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

      <StoreForm
        isOpen={isViewOpen}
        onClose={() => {
          setIsViewOpen(false);
          setSelectedStore(null);
        }}
        mode="view"
        initialData={selectedStore}
      />
    </CrudPageTemplate>
  );
}
