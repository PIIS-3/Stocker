import { Plus } from 'lucide-react';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table';

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
import { CategoryForm, CrudTable } from '../../components/organisms';

// ── Templates ───────────────────────────────────────────────────────────────
import { CrudPageTemplate } from '../../components/templates';

// ── Queries y Hooks ────────────────────────────────────────────────────────
import { categoriesListOptions, useDeleteCategory } from '../../queries/categories.queries';
import { useCrud } from '../../hooks/useCrud';
import type { CategoryApi } from '../../services/categories.service';
import { authService } from '../../services/auth.service';

const columnHelper = createColumnHelper<CategoryApi>();
const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

/**
 * Página: CategoriesList
 * Refactorizada con useCrud hook.
 */
export default function CategoriesList() {
  const canEdit = authService.can('edit', 'categories');
  const canDelete = authService.can('delete', 'categories');

  // ── Lógica de Datos ──────────────────────────────────────────────────────
  const { data: allCategories = [], isLoading, error } = useQuery(categoriesListOptions());

  const deleteMutation = useDeleteCategory();

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
  } = useCrud<CategoryApi>({
    moduleKey: 'categories',
    itemNameKey: 'category_name',
    data: allCategories,
    onDelete: async (item) => {
      await deleteMutation.mutateAsync(item.id_category);
    },
  });

  const { totalPages, totalItems } = paginationData;

  // ── Columnas ─────────────────────────────────────────────────────────────
  const columns = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const baseColumns: ColumnDef<CategoryApi, any>[] = [
      columnHelper.accessor('category_name', {
        header: 'Nombre de Categoría',
        size: 200,
        cell: (info) => (
          <span className="font-medium text-gray-900" title={info.getValue()}>
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('description', {
        header: 'Descripción',
        size: 500,
        cell: (info) => (
          <span className="text-gray-600 truncate block" title={info.getValue() || ''}>
            {info.getValue() || '-'}
          </span>
        ),
      }),
      columnHelper.accessor('status', {
        header: 'Estado',
        size: 120,
        cell: (info) => (
          <StatusBadge status={info.getValue()} activeLabel="Activa" inactiveLabel="Inactiva" />
        ),
      }),
    ];

    if (canEdit || canDelete) {
      baseColumns.push(
        columnHelper.display({
          id: 'actions',
          size: 90,
          header: 'Acciones',
          cell: (info) => (
            <ActionButtons
              onEdit={() => openEdit(info.row.original)}
              onDelete={() => openDelete(info.row.original)}
              hideEdit={!canEdit}
              hideDelete={!canDelete}
            />
          ),
        })
      );
    }

    return baseColumns;
  }, [openEdit, openDelete, canEdit, canDelete]);

  return (
    <CrudPageTemplate
      title="Categorías"
      subtitle="Organiza tus productos en clasificaciones lógicas para el inventario."
      headerAction={
        <Button icon={<Plus size={20} />} onClick={openCreate}>
          Nueva Categoría
        </Button>
      }
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      searchPlaceholder="Buscar por nombre o descripción..."
      notification={notification}
      onNotificationClose={closeNotification}
      errorMessage={error ? 'No se pudieron cargar las categorías.' : null}
      tableToolbar={
        <TableToolbar
          id="categories-toolbar"
          pageSize={pagination.pageSize}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          onPageSizeChange={(size) =>
            setPagination({ ...pagination, pageSize: size, pageIndex: 0 })
          }
        />
      }
      table={
        <CrudTable
          data={allCategories}
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
        title="Eliminar Categoría"
        itemName={itemToDelete?.category_name}
        isLoading={isDeleting}
      />

      <CategoryForm
        isOpen={modalStates.isCreateOpen}
        onClose={closeModals}
        mode="create"
        onSuccess={(action, data) => handleSuccess(action, data, 'Categoría')}
      />

      <CategoryForm
        isOpen={modalStates.isEditOpen}
        onClose={closeModals}
        mode="edit"
        initialData={selectedItem}
        onSuccess={(action, data) => handleSuccess(action, data, 'Categoría')}
      />

      <CategoryForm
        isOpen={modalStates.isViewOpen}
        onClose={closeModals}
        mode="view"
        initialData={selectedItem}
      />
    </CrudPageTemplate>
  );
}
