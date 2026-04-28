import { ChevronLeft, ChevronRight, Loader2, Plus, Trash2 } from 'lucide-react';
import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '../../components/atoms/Button';
import { StatusBadge } from '../../components/atoms/StatusBadge';
import { ActionButtons } from '../../components/molecules/ActionButtons';
import { Modal } from '../../components/molecules/Modal';
import { SearchInput } from '../../components/molecules/SearchInput';
import { ToastNotification, type ToastVariant } from '../../components/molecules/ToastNotification';
import { CategoryDetailsCard } from '../../components/organisms/CategoryDetailsCard';
import { CategoryForm } from '../../components/organisms/CategoryForm';
import { categoriesService } from '../../services/categories.service';
import type { CategoryApi } from '../../services/categories.service';

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
    if (typeof detail === 'string') return detail;
  }
  return fallback;
}

/**
 * Componente: CategoriesList
 * Gestión de categorías.
 */
export default function CategoriesList() {
  const [categories, setCategories] = useState<CategoryApi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPageSize, setSelectedPageSize] = useState(10);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryApi | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryApi | null>(null);
  const [categoryDetail, setCategoryDetail] = useState<CategoryApi | null>(null);
  const [notification, setNotification] = useState<NotificationState | null>(null);

  const loadCategories = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await categoriesService.getCategories(0, 1000);
      setCategories(data);
    } catch {
      setErrorMessage('No se pudieron cargar las categorías.');
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (variant: ToastVariant, title: string, message: string) => {
    setNotification({ id: Date.now(), variant, title, message });
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (!notification) return;
    const timeoutId = window.setTimeout(() => setNotification(null), 3800);
    return () => window.clearTimeout(timeoutId);
  }, [notification]);

  const totalPages = Math.max(1, Math.ceil(categories.length / selectedPageSize));
  const visiblePage = Math.min(currentPage, totalPages);
  const paginatedCategories = useMemo(() => {
    const startIndex = (visiblePage - 1) * selectedPageSize;
    return categories.slice(startIndex, startIndex + selectedPageSize);
  }, [categories, visiblePage, selectedPageSize]);

  const handleEditClick = (category: CategoryApi) => {
    setSelectedCategory(category);
    setIsEditOpen(true);
  };

  const handleCategorySuccess = (action: 'create' | 'update', category: CategoryApi) => {
    void loadCategories();
    showNotification(
      'success',
      action === 'create' ? 'Categoría creada' : 'Categoría actualizada',
      `"${category.category_name}" se guardó correctamente.`
    );
  };

  const handleDeleteClick = (category: CategoryApi) => {
    setCategoryToDelete(category);
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    try {
      await categoriesService.deleteCategory(categoryToDelete.id_category);
      showNotification(
        'success',
        'Categoría eliminada',
        `"${categoryToDelete.category_name}" se eliminó correctamente.`
      );
      setCategoryToDelete(null);
      void loadCategories();
    } catch (error: unknown) {
      const message = getApiErrorMessage(error, 'No se pudo eliminar la categoría.');
      showNotification('error', 'Error al eliminar', message);
    }
  };

  const pageStart = categories.length === 0 ? 0 : (visiblePage - 1) * selectedPageSize + 1;
  const pageEnd = Math.min(pageStart + paginatedCategories.length - 1, categories.length);

  return (
    <div className="p-6 max-w-7xl mx-auto h-full min-h-0 flex flex-col gap-4 overflow-hidden scrollbar-gutter-stable">
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
          <h1 className="text-2xl font-bold text-gray-900">Categorías</h1>
          <p className="mt-1 text-gray-500">Organiza tus productos en grupos lógicos.</p>
        </div>
        <Button icon={<Plus size={20} />} onClick={() => setIsCreateOpen(true)}>
          Nueva Categoría
        </Button>
      </div>

      <div className="flex items-center justify-start gap-3 shrink-0">
        <SearchInput placeholder="Buscar categoría..." className="w-full md:w-96" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-0">
        <div className="p-3 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap shrink-0">
          <div className="flex items-center gap-2">
            <label htmlFor="page-size-select" className="text-sm text-gray-600 font-medium">Mostrar:</label>
            <select
              id="page-size-select"
              value={selectedPageSize}
              onChange={(e) => { setSelectedPageSize(Number(e.target.value)); setCurrentPage(1); }}
              className="px-3 py-2 pr-8 text-sm rounded-lg border border-gray-200 text-gray-700 bg-white"
            >
              {PAGE_SIZE_OPTIONS.map((size) => <option key={size} value={size}>{size}</option>)}
            </select>
          </div>
          <Button variant="ghost" size="sm" onClick={loadCategories}>Actualizar</Button>
        </div>

        <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: `${selectedPageSize * (TABLE_ROW_HEIGHT + 1) + TABLE_HEADER_HEIGHT + 1}px` }}>
          <table className="w-full min-w-[760px] text-left border-collapse">
            <thead>
              <tr className="h-12 bg-gray-50 text-gray-500 text-sm sticky top-0">
                <th className="px-3 align-middle font-medium border-b border-gray-100 w-20">ID</th>
                <th className="px-3 align-middle font-medium border-b border-gray-100">Nombre</th>
                <th className="px-3 align-middle font-medium border-b border-gray-100">Descripción</th>
                <th className="px-3 align-middle font-medium border-b border-gray-100 w-32">Estado</th>
                <th className="px-3 align-middle font-medium border-b border-gray-100 text-right w-32">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm">
              {isLoading ? (
                <tr><td colSpan={5} className="h-32 text-center align-middle text-gray-500"><Loader2 className="animate-spin inline mr-2" size={18} /> Cargando categorías...</td></tr>
              ) : categories.length === 0 ? (
                <tr><td colSpan={5} className="h-32 text-center text-gray-500">No se encontraron categorías.</td></tr>
              ) : (
                paginatedCategories.map((category, index) => (
                  <tr
                    key={category.id_category}
                    onClick={() => setCategoryDetail(category)}
                    className={`h-12 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                  >
                    <td className="px-3 align-middle">#{category.id_category}</td>
                    <td className="px-3 align-middle font-medium text-gray-900">{category.category_name}</td>
                    <td className="px-3 align-middle truncate max-w-xs">{category.description || '-'}</td>
                    <td className="px-3 align-middle"><StatusBadge status={category.status} /></td>
                    <td className="px-3 align-middle text-right" onClick={(e) => e.stopPropagation()}>
                      <ActionButtons onEdit={() => handleEditClick(category)} onDelete={() => handleDeleteClick(category)} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-gray-100 bg-gray-50/70 px-4 py-3 flex items-center justify-between shrink-0">
          <p className="text-xs text-gray-500">Mostrando {pageStart} a {pageEnd} de {categories.length} categorías.</p>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={visiblePage === 1 || isLoading}><ChevronLeft size={16} /> Anterior</Button>
            <span className="text-xs font-medium text-gray-600">Página {visiblePage} de {totalPages}</span>
            <Button variant="ghost" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={visiblePage >= totalPages || isLoading}>Siguiente <ChevronRight size={16} /></Button>
          </div>
        </div>
      </div>

      <Modal isOpen={categoryToDelete !== null} onClose={() => setCategoryToDelete(null)} title="Eliminar Categoría" subtitle="¿Deseas eliminar esta categoría permanentemente?" size="sm">
        <div className="p-6 flex flex-col gap-5">
          <p className="text-sm text-gray-600 text-center">Eliminarás "<span className="font-bold text-gray-900">{categoryToDelete?.category_name}</span>".</p>
          <div className="flex items-center justify-end gap-3">
            <Button variant="ghost" onClick={() => setCategoryToDelete(null)}>Cancelar</Button>
            <Button variant="danger" icon={<Trash2 size={16} />} onClick={confirmDeleteCategory}>Eliminar</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={categoryDetail !== null} onClose={() => setCategoryDetail(null)} title="Detalle de Categoría" size="lg">
        <div className="p-6 bg-gray-50/70">
          <CategoryDetailsCard category={categoryDetail} />
          <div className="flex justify-end mt-4">
            <Button variant="ghost" onClick={() => setCategoryDetail(null)}>Cerrar</Button>
          </div>
        </div>
      </Modal>

      <CategoryForm isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} mode="create" onSuccess={handleCategorySuccess} />
      <CategoryForm isOpen={isEditOpen} onClose={() => { setIsEditOpen(false); setSelectedCategory(null); }} mode="edit" initialData={selectedCategory} onSuccess={handleCategorySuccess} />
    </div>
  );
}
