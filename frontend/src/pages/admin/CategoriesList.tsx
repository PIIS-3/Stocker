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
import { CategoryForm, DataTable } from '../../components/organisms';

// ── Templates ───────────────────────────────────────────────────────────────
import { CrudPageTemplate } from '../../components/templates';

// ── Servicios y Hooks ───────────────────────────────────────────────────────
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
 * Página: CategoriesList
 * Gestión de clasificaciones de productos con filtrado reactivo.
 */
export default function CategoriesList() {
  const [searchTerm, setSearchTerm] = useState('');

  // ── Lógica de Negocio (CRUD) ──────────────────────────────────────────────
  const fetchCategories = useCallback(() => categoriesService.getCategories(0, 1000), []);
  const deleteCategory = useCallback((id: number) => categoriesService.deleteCategory(id), []);

  const filterFn = useCallback(
    (cat: CategoryApi) => {
      const search = searchTerm.toLowerCase();
      return (
        cat.category_name.toLowerCase().includes(search) ||
        (cat.description || '').toLowerCase().includes(search)
      );
    },
    [searchTerm]
  );

  const {
    items: categories,
    isLoading,
    errorMessage,
    pagination,
    refresh,
    remove,
  } = useCrud<CategoryApi>(fetchCategories, deleteCategory, { filterFn });

  // ── Estados de Interfaz (UI) ──────────────────────────────────────────────
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryApi | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryApi | null>(null);
  const [notification, setNotification] = useState<NotificationState | null>(null);

  // ── Manejadores de Eventos (Handlers) ────────────────────────────────────

  const showNotification = useCallback((variant: ToastVariant, title: string, message: string) => {
    setNotification({ id: Date.now(), variant, title, message });
    setTimeout(() => setNotification(null), 3800);
  }, []);

  const handleCategorySuccess = (action: 'create' | 'update', category: CategoryApi) => {
    void refresh();
    showNotification(
      'success',
      action === 'create' ? 'Categoría creada' : 'Categoría actualizada',
      `${category.category_name} ha sido guardada correctamente.`
    );
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    try {
      await remove(categoryToDelete.id_category);
      showNotification(
        'success',
        'Categoría eliminada',
        `${categoryToDelete.category_name} ha sido borrada del sistema.`
      );
      setCategoryToDelete(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al eliminar categoría.';
      showNotification('error', 'Error', message);
    }
  };

  return (
    <CrudPageTemplate
      title="Categorías"
      subtitle="Organiza tus productos en clasificaciones lógicas para el inventario."
      headerAction={
        <Button icon={<Plus size={20} />} onClick={() => setIsCreateOpen(true)}>
          Nueva Categoría
        </Button>
      }
      // Búsqueda
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      searchPlaceholder="Buscar por nombre o descripción..."
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
        />
      }
      table={
        <DataTable
          columns={['ID', 'Nombre de Categoría', 'Descripción', 'Estado', 'Acciones']}
          isLoading={isLoading}
          rowCount={categories.length}
          expectedRows={pagination.pageSize}
          emptyMessage="No se encontraron categorías con los filtros actuales."
        >
          {categories.map((category, index) => (
            <tr
              key={category.id_category}
              onClick={() => {
                setSelectedCategory(category);
                setIsViewOpen(true);
              }}
              className={`h-12 hover:bg-gray-100 transition-colors border-b border-gray-50 cursor-pointer ${
                index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
              }`}
            >
              <td className="px-4 py-0 align-middle text-gray-500 font-mono text-xs">
                #{category.id_category}
              </td>
              <td className="px-4 py-0 align-middle font-medium text-gray-900">
                {category.category_name}
              </td>
              <td className="px-4 py-0 align-middle text-gray-600 truncate max-w-[300px]">
                {category.description || '-'}
              </td>
              <td className="px-4 py-0 align-middle">
                <StatusBadge
                  status={category.status}
                  activeLabel="Activa"
                  inactiveLabel="Inactiva"
                />
              </td>
              <td className="px-4 py-0 align-middle">
                <ActionButtons
                  onEdit={() => {
                    setSelectedCategory(category);
                    setIsEditOpen(true);
                  }}
                  onDelete={() => setCategoryToDelete(category)}
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
        isOpen={categoryToDelete !== null}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={confirmDelete}
        title="Eliminar Categoría"
        itemName={categoryToDelete?.category_name}
        isLoading={isLoading}
      />

      <CategoryForm
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        mode="create"
        onSuccess={handleCategorySuccess}
      />

      <CategoryForm
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedCategory(null);
        }}
        mode="edit"
        initialData={selectedCategory}
        onSuccess={handleCategorySuccess}
      />

      <CategoryForm
        isOpen={isViewOpen}
        onClose={() => {
          setIsViewOpen(false);
          setSelectedCategory(null);
        }}
        mode="view"
        initialData={selectedCategory}
      />
    </CrudPageTemplate>
  );
}
