import { Plus, Package, Tag as TagIcon, Filter } from 'lucide-react';
import { useState, useMemo } from 'react';
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
import { ProductForm, CrudTable } from '../../components/organisms';

// ── Templates ───────────────────────────────────────────────────────────────
import { CrudPageTemplate } from '../../components/templates';

// ── Queries y Hooks ────────────────────────────────────────────────────────
import {
  productsListOptions,
  useDeleteProduct,
} from '../../queries/products.queries';
import { categoriesListOptions } from '../../queries/categories.queries';
import { useCrud } from '../../hooks/useCrud';
import type { ProductApi } from '../../services/products.service';

const columnHelper = createColumnHelper<ProductApi>();
const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

/**
 * Página: ProductsList
 * Gestión del catálogo maestro de productos refactorizada con useCrud.
 */
export default function ProductsList() {
  const [categoryFilter, setCategoryFilter] = useState<number>(0);

  // ── Lógica de Datos ──────────────────────────────────────────────────────
  const { data: allProducts = [], isLoading, error } = useQuery(productsListOptions());
  const { data: categories = [] } = useQuery(categoriesListOptions());

  const filteredProducts = useMemo(() => {
    let result = allProducts;
    if (categoryFilter !== 0) {
      result = result.filter((p) => p.category_id === categoryFilter);
    }
    return result;
  }, [allProducts, categoryFilter]);

  const deleteMutation = useDeleteProduct();

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
  } = useCrud<ProductApi>({
    moduleKey: 'products',
    itemNameKey: 'product_name',
    data: filteredProducts,
    onDelete: async (item) => {
      await deleteMutation.mutateAsync(item.id_product);
    },
  });

  const { totalPages, totalItems } = paginationData;

  // ── Columnas ─────────────────────────────────────────────────────────────
  const columns = useMemo(
    () => [
      columnHelper.accessor('sku', {
        header: 'SKU',
        size: 110,
        cell: (info) => (
          <span className="font-mono text-xs text-brand font-semibold tracking-wider" title={info.getValue()}>
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('product_name', {
        header: 'Producto / Marca',
        size: 300,
        cell: (info) => (
          <div className="flex flex-col">
            <span className="font-medium text-gray-900" title={info.getValue()}>{info.getValue()}</span>
            <span className="text-xs text-gray-500 flex items-center gap-1" title={info.row.original.brand || 'Marca genérica'}>
              <Package size={10} /> {info.row.original.brand || 'Marca genérica'}
            </span>
          </div>
        ),
      }),
      columnHelper.accessor((row) => row.category?.category_name, {
        id: 'category_name',
        header: 'Categoría',
        size: 180,
        cell: (info) => (
          <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-200 flex items-center gap-1.5 w-fit" title={info.getValue() || 'Sin categoría'}>
            <TagIcon size={12} />
            {info.getValue() || 'Sin categoría'}
          </span>
        ),
      }),
      columnHelper.accessor('fixed_selling_price', {
        header: 'Precio Venta',
        size: 120,
        cell: (info) => (
          <span 
            className="font-semibold text-gray-900" 
            title={info.getValue().toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
          >
            {info.getValue().toLocaleString('es-ES', {
              style: 'currency',
              currency: 'EUR',
            })}
          </span>
        ),
      }),
      columnHelper.accessor('status', {
        header: 'Estado',
        size: 130,
        cell: (info) => (
          <StatusBadge
            status={info.getValue()}
            activeLabel="Disponible"
            inactiveLabel="Descatalogado"
          />
        ),
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
      title="Catálogo maestro"
      subtitle="Define las especificaciones de tus productos, precios base y categorías."
      headerAction={
        <Button icon={<Plus size={20} />} onClick={openCreate}>
          Nuevo Producto
        </Button>
      }
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      searchPlaceholder="Buscar por SKU, nombre o marca..."
      notification={notification}
      onNotificationClose={closeNotification}
      errorMessage={error ? 'No se pudieron cargar los productos.' : null}
      tableToolbar={
        <TableToolbar
          id="products-toolbar"
          pageSize={pagination.pageSize}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          onPageSizeChange={(size) => setPagination({ ...pagination, pageSize: size, pageIndex: 0 })}
        >
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <select
              title="Filtrar por categoría"
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(Number(e.target.value));
                setPagination((prev) => ({ ...prev, pageIndex: 0 }));
              }}
              className="px-3 py-2 text-sm rounded-lg border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 outline-none focus:ring-2 focus:ring-brand"
            >
              <option value={0}>Todas las categorías</option>
              {categories.map((cat) => (
                <option key={cat.id_category} value={cat.id_category}>
                  {cat.category_name}
                </option>
              ))}
            </select>
          </div>
        </TableToolbar>
      }
      table={
        <CrudTable
          data={filteredProducts}
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
            const nextPageIndex = typeof updater === 'function' ? updater(pagination.pageIndex + 1) - 1 : updater - 1;
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
        title="Eliminar del Catálogo"
        itemName={itemToDelete?.product_name}
        isLoading={isDeleting}
      />

      <ProductForm
        isOpen={modalStates.isCreateOpen}
        onClose={closeModals}
        mode="create"
        onSuccess={(action, data) => handleSuccess(action, data, 'Producto')}
      />

      <ProductForm
        isOpen={modalStates.isEditOpen}
        onClose={closeModals}
        mode="edit"
        initialData={selectedItem}
        onSuccess={(action, data) => handleSuccess(action, data, 'Producto')}
      />

      <ProductForm
        isOpen={modalStates.isViewOpen}
        onClose={closeModals}
        mode="view"
        initialData={selectedItem}
      />
    </CrudPageTemplate>
  );
}
