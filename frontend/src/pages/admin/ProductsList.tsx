import { Plus, Package, Tag as TagIcon, Filter } from 'lucide-react';
import { useState, useCallback, useEffect } from 'react';

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
import { ProductForm, DataTable } from '../../components/organisms';

// ── Templates ───────────────────────────────────────────────────────────────
import { CrudPageTemplate } from '../../components/templates';

// ── Servicios y Hooks ───────────────────────────────────────────────────────
import { productsService, type ProductApi } from '../../services/products.service';
import { categoriesService, type CategoryApi } from '../../services/categories.service';
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
 * Página: ProductsList
 * Gestión del catálogo maestro de productos (Plantillas).
 * Implementa filtrado local y búsqueda avanzada por SKU/Nombre/Marca.
 */
export default function ProductsList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<number>(0);
  const [categories, setCategories] = useState<CategoryApi[]>([]);

  // ── Lógica de Negocio (CRUD) ──────────────────────────────────────────────
  const fetchProducts = useCallback(() => productsService.getProducts(0, 1000), []);
  const deleteProduct = useCallback((id: number) => productsService.deleteProduct(id), []);

  const filterFn = useCallback(
    (prod: ProductApi) => {
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        prod.product_name.toLowerCase().includes(search) ||
        prod.sku.toLowerCase().includes(search) ||
        (prod.brand || '').toLowerCase().includes(search);

      const matchesCategory = categoryFilter === 0 || prod.category_id === categoryFilter;

      return matchesSearch && matchesCategory;
    },
    [searchTerm, categoryFilter]
  );

  const {
    items: products,
    isLoading,
    errorMessage,
    pagination,
    refresh,
    remove,
  } = useCrud<ProductApi>(fetchProducts, deleteProduct, { filterFn });

  // ── Carga de Categorías para Filtro ──
  useEffect(() => {
    void categoriesService.getCategories(0, 1000).then(setCategories);
  }, []);

  // ── Estados de Interfaz (UI) ──────────────────────────────────────────────
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductApi | null>(null);
  const [productToDelete, setProductToDelete] = useState<ProductApi | null>(null);
  const [notification, setNotification] = useState<NotificationState | null>(null);

  // ── Manejadores de Eventos (Handlers) ────────────────────────────────────

  const showNotification = useCallback((variant: ToastVariant, title: string, message: string) => {
    setNotification({ id: Date.now(), variant, title, message });
    setTimeout(() => setNotification(null), 3800);
  }, []);

  const handleProductSuccess = (action: 'create' | 'update', product: ProductApi) => {
    void refresh();
    showNotification(
      'success',
      action === 'create' ? 'Producto creado' : 'Producto actualizado',
      `El producto ${product.product_name} ha sido guardado.`
    );
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await remove(productToDelete.id_product);
      showNotification(
        'success',
        'Producto eliminado',
        `${productToDelete.product_name} ha sido retirado del catálogo.`
      );
      setProductToDelete(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al eliminar producto.';
      showNotification('error', 'Error', message);
    }
  };

  return (
    <CrudPageTemplate
      title="Catálogo maestro"
      subtitle="Define las especificaciones de tus productos, precios base y categorías."
      headerAction={
        <Button icon={<Plus size={20} />} onClick={() => setIsCreateOpen(true)}>
          Nuevo Producto
        </Button>
      }
      // Búsqueda
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      searchPlaceholder="Buscar por SKU, nombre o marca..."
      // Notificaciones
      notification={notification}
      onNotificationClose={() => setNotification(null)}
      errorMessage={errorMessage}
      // Configuración de Tabla
      tableToolbar={
        <TableToolbar
          pageSize={pagination.pageSize}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          onPageSizeChange={pagination.setPageSize}
          onRefresh={refresh}
          isLoading={isLoading}
        >
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(Number(e.target.value))}
              className="px-3 py-2 text-sm rounded-lg border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 transition-colors outline-none focus:ring-2 focus:ring-brand"
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
        <DataTable
          columns={['SKU', 'Producto / Marca', 'Categoría', 'Precio Venta', 'Estado', 'Acciones']}
          isLoading={isLoading}
          rowCount={products.length}
          expectedRows={pagination.pageSize}
          emptyMessage="No se encontraron productos con los filtros actuales."
        >
          {products.map((prod, index) => (
            <tr
              key={prod.id_product}
              onClick={() => {
                setSelectedProduct(prod);
                setIsViewOpen(true);
              }}
              className={`h-14 hover:bg-gray-100 transition-colors border-b border-gray-50 cursor-pointer ${
                index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
              }`}
            >
              <td className="px-4 py-0 align-middle">
                <span className="font-mono text-xs text-brand font-semibold tracking-wider">
                  {prod.sku}
                </span>
              </td>
              <td className="px-4 py-0 align-middle">
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900">{prod.product_name}</span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Package size={10} /> {prod.brand || 'Marca genérica'}
                  </span>
                </div>
              </td>
              <td className="px-4 py-0 align-middle">
                <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-200 flex items-center gap-1.5 w-fit">
                  <TagIcon size={12} />
                  {prod.category?.category_name || 'Sin categoría'}
                </span>
              </td>
              <td className="px-4 py-0 align-middle font-semibold text-gray-900">
                {prod.fixed_selling_price.toLocaleString('es-ES', {
                  style: 'currency',
                  currency: 'EUR',
                })}
              </td>
              <td className="px-4 py-0 align-middle">
                <StatusBadge
                  status={prod.status}
                  activeLabel="Disponible"
                  inactiveLabel="Descatalogado"
                />
              </td>
              <td className="px-4 py-0 align-middle">
                <ActionButtons
                  onEdit={() => {
                    setSelectedProduct(prod);
                    setIsEditOpen(true);
                  }}
                  onDelete={() => setProductToDelete(prod)}
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
        isOpen={productToDelete !== null}
        onClose={() => setProductToDelete(null)}
        onConfirm={confirmDelete}
        title="Eliminar del Catálogo"
        itemName={productToDelete?.product_name}
        isLoading={isLoading}
      />

      <ProductForm
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        mode="create"
        onSuccess={handleProductSuccess}
      />

      <ProductForm
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedProduct(null);
        }}
        mode="edit"
        initialData={selectedProduct}
        onSuccess={handleProductSuccess}
      />

      <ProductForm
        isOpen={isViewOpen}
        onClose={() => {
          setIsViewOpen(false);
          setSelectedProduct(null);
        }}
        mode="view"
        initialData={selectedProduct}
      />
    </CrudPageTemplate>
  );
}
