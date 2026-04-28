import { ChevronLeft, ChevronRight, Loader2, Plus, Trash2 } from 'lucide-react';
import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '../../components/atoms/Button';
import { StatusBadge } from '../../components/atoms/StatusBadge';
import { ActionButtons } from '../../components/molecules/ActionButtons';
import { Modal } from '../../components/molecules/Modal';
import { SearchInput } from '../../components/molecules/SearchInput';
import { ToastNotification, type ToastVariant } from '../../components/molecules/ToastNotification';
import { StoreDetailsCard } from '../../components/organisms/StoreDetailsCard';
import { StoreForm } from '../../components/organisms/StoreForm';
import { storesService } from '../../services/stores.service';
import type { StoreApi } from '../../services/stores.service';

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];
const TABLE_ROW_HEIGHT = 48;
const TABLE_HEADER_HEIGHT = 48;

interface NotificationState {
  id: number;
  title: string;
  message: string;
  variant: ToastVariant;
}

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === 'string') {
      return detail;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

/**
 * Componente: StoresList
 * Página de administración que muestra el listado de tiendas físicas.
 * Permite realizar operaciones CRUD (Crear, Leer, Actualizar, Eliminar)
 * e incluye paginación y notificaciones con sonido.
 */
export default function StoresList() {
  const [stores, setStores] = useState<StoreApi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  // Default page size is 5 as requested.
  const [selectedPageSize, setSelectedPageSize] = useState(5);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<StoreApi | null>(null);
  const [storeToDelete, setStoreToDelete] = useState<StoreApi | null>(null);
  const [storeDetail, setStoreDetail] = useState<StoreApi | null>(null);
  const [notification, setNotification] = useState<NotificationState | null>(null);

  const loadStores = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await storesService.getStores(0, 1000);
      setStores(data);
    } catch {
      setErrorMessage('No se pudieron cargar las tiendas. Reintenta en unos segundos.');
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (variant: ToastVariant, title: string, message: string) => {
    setNotification({
      id: Date.now(),
      variant,
      title,
      message,
    });
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadStores();
  }, []);

  useEffect(() => {
    if (!notification) return;

    const timeoutId = window.setTimeout(() => {
      setNotification(null);
    }, 3800);

    return () => window.clearTimeout(timeoutId);
  }, [notification]);

  const totalPages = Math.max(1, Math.ceil(stores.length / selectedPageSize));
  const visiblePage = Math.min(currentPage, totalPages);
  const paginatedStores = useMemo(() => {
    const startIndex = (visiblePage - 1) * selectedPageSize;
    return stores.slice(startIndex, startIndex + selectedPageSize);
  }, [stores, visiblePage, selectedPageSize]);

  const handleEditClick = (store: StoreApi) => {
    setSelectedStore(store);
    setIsEditOpen(true);
  };

  const handleStoreSuccess = (action: 'create' | 'update', store: StoreApi) => {
    void loadStores();
    showNotification(
      'success',
      action === 'create' ? 'Tienda creada' : 'Tienda actualizada',
      `${store.store_name} se guardó correctamente.`
    );
  };

  const handleStoreError = (message: string) => {
    showNotification('error', 'No se pudo guardar la tienda', message);
  };

  const handleDeleteClick = (store: StoreApi) => {
    setStoreToDelete(store);
  };

  const confirmDeleteStore = async () => {
    if (!storeToDelete) return;

    try {
      await storesService.deleteStore(storeToDelete.id_store);
      showNotification(
        'success',
        'Tienda eliminada',
        `${storeToDelete.store_name} se eliminó correctamente.`
      );
      setStoreToDelete(null);
      void loadStores();
    } catch (error: unknown) {
      const message = getApiErrorMessage(
        error,
        'No se pudo eliminar la tienda. Intenta nuevamente.'
      );
      showNotification('error', 'No se pudo eliminar la tienda', message);
    }
  };

  const pageStart = stores.length === 0 ? 0 : (visiblePage - 1) * selectedPageSize + 1;
  const pageEnd = Math.min(pageStart + paginatedStores.length - 1, stores.length);

  return (
    <div className="p-6 max-w-7xl mx-auto h-full min-h-0 flex flex-col gap-4 overflow-hidden scrollbar-gutter-stable">
      {/* Renderizamos notificación si existe. `playSound` está activado por defecto aquí,
          pero `ToastNotification` validará la preferencia global antes de reproducir.
          Esto asegura que el sonido solo se reproduzca si el usuario lo habilitó. */}
      {notification && (
        <ToastNotification
          variant={notification.variant}
          title={notification.title}
          message={notification.message}
          onClose={() => setNotification(null)}
          playSound
          soundUrl="/sounds/notification-chime.mp3"
        />
      )}

      <div className="flex items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tiendas Físicas</h1>
          <p className="mt-1 text-gray-500">Gestión de sucursales y puntos de venta.</p>
        </div>
        <Button icon={<Plus size={20} />} onClick={() => setIsCreateOpen(true)}>
          Nueva Tienda
        </Button>
      </div>

      <div className="flex items-center justify-start gap-3 shrink-0">
        <SearchInput placeholder="Buscar tienda..." className="w-full md:w-96" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-0">
        <div className="p-3 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap shrink-0">
          <div className="flex items-center gap-2">
            <label htmlFor="page-size-select" className="text-sm text-gray-600 font-medium">
              Mostrar:
            </label>
            <select
              id="page-size-select"
              value={selectedPageSize}
              onChange={(e) => {
                setSelectedPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-2 pr-8 text-sm rounded-lg border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 transition-colors cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22currentColor%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22%3e%3cpolyline points=%226 9 12 15 18 9%3e%3c/polyline%3e%3c/svg%3e')] bg-no-repeat bg-right bg-[length:20px]"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span className="text-sm text-gray-600">por página</span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={loadStores}
              className="px-3 py-2 text-sm rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Actualizar
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="mx-3 mt-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 flex items-center justify-between gap-3 shrink-0">
            <span>{errorMessage}</span>
            <button
              type="button"
              onClick={loadStores}
              className="px-3 py-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        )}

        <div
          className="overflow-x-auto overflow-y-auto"
          style={{
            maxHeight: `${selectedPageSize * (TABLE_ROW_HEIGHT + 1) + TABLE_HEADER_HEIGHT + 1}px`,
          }}
        >
          <table className="w-full min-w-[760px] text-left border-collapse">
            <thead>
              <tr className="h-12 bg-gray-50 text-gray-500 text-sm sticky top-0">
                <th className="px-3 py-0 align-middle font-medium border-b border-gray-100">ID</th>
                <th className="px-3 py-0 align-middle font-medium border-b border-gray-100">
                  Nombre
                </th>
                <th className="px-3 py-0 align-middle font-medium border-b border-gray-100">
                  Dirección
                </th>
                <th className="px-3 py-0 align-middle font-medium border-b border-gray-100">
                  Estado
                </th>
                <th className="px-3 py-0 align-middle font-medium border-b border-gray-100 text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm">
              {isLoading && (
                <tr>
                  <td colSpan={5} className="h-32 p-6 text-center text-gray-500 align-middle">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 size={18} className="animate-spin" />
                      <span>Cargando tiendas...</span>
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading && !errorMessage && stores.length === 0 && (
                <tr>
                  <td colSpan={5} className="h-32 p-6 text-center text-gray-500 align-middle">
                    No hay tiendas para mostrar.
                  </td>
                </tr>
              )}

              {!isLoading &&
                !errorMessage &&
                paginatedStores.map((store, index) => (
                  <tr
                    key={store.id_store}
                    onClick={() => setStoreDetail(store)}
                    className={`h-12 hover:bg-gray-100 transition-colors border-b border-gray-50 cursor-pointer ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <td className="px-3 py-0 align-middle truncate max-w-16">#{store.id_store}</td>
                    <td className="px-3 py-0 align-middle font-medium text-gray-900 truncate max-w-48">
                      {store.store_name}
                    </td>
                    <td className="px-3 py-0 align-middle truncate max-w-xs">{store.address}</td>
                    <td className="px-3 py-0 align-middle">
                      <StatusBadge status={store.status} />
                    </td>
                    <td
                      className="px-3 py-0 align-middle"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <ActionButtons
                        onEdit={() => handleEditClick(store)}
                        onDelete={() => handleDeleteClick(store)}
                      />
                    </td>
                  </tr>
                ))}

              {!isLoading &&
                !errorMessage &&
                stores.length > 0 &&
                Array.from({ length: Math.max(0, selectedPageSize - paginatedStores.length) }).map(
                  (_, index) => (
                    <tr
                      key={`empty-${index}`}
                      className={`h-12 border-b border-gray-50 ${
                        (paginatedStores.length + index) % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <td colSpan={5} />
                    </tr>
                  )
                )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-gray-100 bg-gray-50/70 px-4 py-3 flex items-center justify-between gap-4 flex-wrap shrink-0">
          <p className="text-xs text-gray-500">
            Mostrando {pageStart} a {pageEnd} de {stores.length} tiendas.
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={visiblePage === 1 || isLoading || stores.length === 0}
              className="disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-gray-600"
            >
              <span className="inline-flex items-center gap-1">
                <span>Anterior</span>
                <ChevronLeft size={16} />
              </span>
            </Button>
            <span className="text-xs font-medium text-gray-600 px-2">
              Página {visiblePage} de {totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={visiblePage >= totalPages || isLoading || stores.length === 0}
              className="disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-gray-600"
              icon={<ChevronRight size={16} />}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={storeToDelete !== null}
        onClose={() => setStoreToDelete(null)}
        title="Eliminar tienda"
        subtitle="Esta acción no se puede deshacer."
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
                <p className="mt-1 text-sm text-rose-800/90">
                  Si la tienda tiene empleados u otros registros asociados, el sistema no permitirá
                  borrarla.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <Button variant="ghost" type="button" onClick={() => setStoreToDelete(null)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              type="button"
              onClick={confirmDeleteStore}
              icon={<Trash2 size={16} />}
            >
              Eliminar tienda
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={storeDetail !== null}
        onClose={() => setStoreDetail(null)}
        title="Detalles de la Tienda"
        size="lg"
      >
        <div className="p-6 bg-gray-50/70">
          <StoreDetailsCard store={storeDetail} />

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button variant="ghost" type="button" onClick={() => setStoreDetail(null)}>
              Cerrar
            </Button>
          </div>
        </div>
      </Modal>

      <StoreForm
        key={`create-${isCreateOpen ? 'open' : 'closed'}`}
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        mode="create"
        onSuccess={handleStoreSuccess}
        onError={handleStoreError}
      />
      <StoreForm
        key={`edit-${isEditOpen ? (selectedStore?.id_store ?? 'none') : 'closed'}`}
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedStore(null);
        }}
        mode="edit"
        initialData={selectedStore}
        onSuccess={handleStoreSuccess}
        onError={handleStoreError}
      />
    </div>
  );
}
