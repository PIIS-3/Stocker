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
 * Gestión de categorías para la clasificación del catálogo.
 * Utiliza CrudPageTemplate para mantener la consistencia visual.
 */
export default function CategoriesList() {
  // ── Lógica de Negocio (CRUD) ──────────────────────────────────────────────
  const fetchCategories = useCallback(() => categoriesService.getCategories(0, 1000), []);
  const deleteCategory = useCallback((id: number) => categoriesService.deleteCategory(id), []);

  const {
    items: categories,
    isLoading,
    errorMessage,
    pagination,
    refresh,
    remove,
  } = useCrud<CategoryApi>(fetchCategories, deleteCategory);

  // ── Estados de Interfaz (UI) ──────────────────────────────────────────────
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryApi | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryApi | null>(null);
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

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
        `${categoryToDelete.category_name} ha sido eliminada.`
      );
      setCategoryToDelete(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'No se pudo eliminar la categoría.';
      showNotification('error', 'Error de Integridad', message);
    }
  };

  // ── Renderizado ──────────────────────────────────────────────────────────

  return (
    <CrudPageTemplate
      title="Categorías"
      subtitle="Organiza tu catálogo de productos por grupos lógicos."
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
          columns={['ID', 'Nombre', 'Descripción', 'Estado', 'Acciones']}
          isLoading={isLoading}
          rowCount={categories.length}
          expectedRows={pagination.pageSize}
          emptyMessage="No hay categorías registradas."
        >
          {categories.map((category, index) => (
            <tr
              key={category.id_category}
              className={`h-12 hover:bg-gray-100 transition-colors border-b border-gray-50 ${
                index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
              }`}
            >
              <td className="px-3 py-0 align-middle truncate max-w-16 text-gray-500">
                #{category.id_category}
              </td>
              <td className="px-3 py-0 align-middle font-medium text-gray-900 truncate max-w-48">
                {category.category_name}
              </td>
              <td className="px-3 py-0 align-middle truncate max-w-xs text-gray-600">
                {category.description || '-'}
              </td>
              <td className="px-3 py-0 align-middle">
                <StatusBadge
                  status={category.status}
                  activeLabel="Activa"
                  inactiveLabel="Inactiva"
                />
              </td>
              <td className="px-3 py-0 align-middle">
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
      {/* Modales de Acción */}

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
    </CrudPageTemplate>
  );
}
