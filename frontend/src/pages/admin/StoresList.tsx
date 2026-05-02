import { Plus } from 'lucide-react';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createColumnHelper } from '@tanstack/react-table';

// ── Átomos ──────────────────────────────────────────────────────────────────
import { Button, StatusBadge } from '../../components/atoms';

// ── Moléculas ───────────────────────────────────────────────────────────────
import {
  ActionButtons,
  TableToolbar,
  TablePagination,
  ConfirmDeleteModal,
} from '../../components/molecules';

// ── Organismos ──────────────────────────────────────────────────────────────
import { StoreForm, CrudTable } from '../../components/organisms';

// ── Templates ───────────────────────────────────────────────────────────────
import { CrudPageTemplate } from '../../components/templates';

// ── Queries y Hooks ────────────────────────────────────────────────────────
import { storesListOptions, useDeleteStore } from '../../queries/stores.queries';
import { useCrud } from '../../hooks/useCrud';
import type { StoreApi } from '../../services/stores.service';

const columnHelper = createColumnHelper<StoreApi>();
const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

/**
 * Página: StoresList
 * Gestión modular de tiendas físicas refactorizada con useCrud.
 */
export default function StoresList() {
  // ── Lógica de Datos ──────────────────────────────────────────────────────
  const { data: allStores = [], isLoading, error } = useQuery(storesListOptions());

  const deleteMutation = useDeleteStore();

  const {
    searchTerm,
    pagination,
    selectedItem,
    itemToDelete,
    isDeleting,
    notification,
    modalStates,
    setSearchTerm,
    setPagination,
    setItemToDelete,
    openCreate,
    openEdit,
    openView,
    openDelete,
    closeModals,
    closeNotification,
    handleSuccess,
    confirmDelete,
    paginationData,
  } = useCrud<StoreApi>({
    moduleKey: 'stores',
    itemNameKey: 'store_name',
    data: allStores,
    onDelete: async (item) => {
      await deleteMutation.mutateAsync(item.id_store);
    },
  });

  const { totalPages, totalItems } = paginationData;

  // ── Columnas ─────────────────────────────────────────────────────────────
  const columns = useMemo(
    () => [
      columnHelper.accessor('store_name', {
        header: 'Nombre',
        size: 250,
        cell: (info) => (
          <span className="font-medium text-gray-900" title={info.getValue()}>
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('address', {
        header: 'Dirección',
        cell: (info) => (
          <span className="text-gray-600 truncate block" title={info.getValue()}>
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('status', {
        header: 'Estado',
        size: 130,
        cell: (info) => <StatusBadge status={info.getValue()} />,
      }),
      columnHelper.display({
        id: 'actions',
        size: 100,
        header: 'Acciones',
        cell: (info) => (
          <ActionButtons
            onEdit={() => openEdit(info.row.original)}
            onDelete={() => openDelete(info.row.original)}
          />
        ),
      }),
    ],
    [openEdit, openDelete]
  );

  return (
    <CrudPageTemplate
      title="Tiendas Físicas"
      subtitle="Administra las sucursales, almacenes y puntos de venta del sistema."
      headerAction={
        <Button icon={<Plus size={20} />} onClick={openCreate}>
          Nueva Tienda
        </Button>
      }
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      searchPlaceholder="Buscar por nombre o dirección..."
      notification={notification}
      onNotificationClose={closeNotification}
      errorMessage={error ? 'No se pudieron cargar las tiendas.' : null}
      tableToolbar={
        <TableToolbar
          id="stores-toolbar"
          pageSize={pagination.pageSize}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          onPageSizeChange={(size) =>
            setPagination({ ...pagination, pageSize: size, pageIndex: 0 })
          }
        />
      }
      table={
        <CrudTable
          data={allStores}
          columns={columns}
          isLoading={isLoading}
          pagination={pagination}
          onPaginationChange={setPagination}
          globalFilter={searchTerm}
          onRowClick={openView}
        />
      }
      tablePagination={
        <TablePagination
          currentPage={pagination.pageIndex + 1}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pagination.pageSize}
          onPageChange={(updater) => {
            const nextPageIndex =
              typeof updater === 'function' ? updater(pagination.pageIndex + 1) - 1 : updater - 1;
            setPagination((prev) => ({ ...prev, pageIndex: nextPageIndex }));
          }}
          isLoading={isLoading}
        />
      }
    >
      <ConfirmDeleteModal
        isOpen={itemToDelete !== null}
        onClose={() => setItemToDelete(null)}
        onConfirm={confirmDelete}
        title="Eliminar Tienda"
        itemName={itemToDelete?.store_name}
        isLoading={isDeleting}
      />

      <StoreForm
        isOpen={modalStates.isCreateOpen}
        onClose={closeModals}
        mode="create"
        onSuccess={(action, data) => handleSuccess(action, data, 'Tienda')}
      />

      <StoreForm
        isOpen={modalStates.isEditOpen}
        onClose={closeModals}
        mode="edit"
        initialData={selectedItem}
        onSuccess={(action, data) => handleSuccess(action, data, 'Tienda')}
      />

      <StoreForm
        isOpen={modalStates.isViewOpen}
        onClose={closeModals}
        mode="view"
        initialData={selectedItem}
      />
    </CrudPageTemplate>
  );
}
