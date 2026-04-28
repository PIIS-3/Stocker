import { Save, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '../atoms/Button';
import { Modal } from '../molecules/Modal';
import { categoriesService } from '../../services/categories.service';
import type { CategoryCreate, CategoryApi } from '../../services/categories.service';

type CategoryFormAction = 'create' | 'update';

interface CategoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'create' | 'edit';
  initialData?: CategoryApi | null;
  onSuccess?: (action: CategoryFormAction, category: CategoryApi) => void;
  onError?: (message: string) => void;
}

/**
 * Componente: CategoryForm
 * Formulario modal para la gestión de categorías.
 */
export function CategoryForm({
  isOpen,
  onClose,
  mode = 'create',
  initialData,
  onSuccess,
  onError,
}: CategoryFormProps) {
  const isEdit = mode === 'edit';

  const createInitialFormData = (): CategoryCreate => {
    if (isEdit && initialData) {
      return {
        category_name: initialData.category_name,
        description: initialData.description ?? '',
        status: initialData.status,
      };
    }
    return {
      category_name: '',
      description: '',
      status: 'Active',
    };
  };

  const [formData, setFormData] = useState<CategoryCreate>(createInitialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData(createInitialFormData());
      setError(null);
    }
  }, [isOpen, initialData, mode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    const name = id.replace('category-', '');
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const action: CategoryFormAction = isEdit ? 'update' : 'create';
      let savedCategory: CategoryApi;

      if (isEdit && initialData) {
        savedCategory = await categoriesService.updateCategory(initialData.id_category, formData);
      } else {
        savedCategory = await categoriesService.createCategory(formData);
      }

      onSuccess?.(action, savedCategory);
      onClose();
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Ocurrió un error al guardar la categoría.';
      setError(message);
      onError?.(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Editar Categoría' : 'Nueva Categoría'}
      subtitle={
        isEdit
          ? 'Modifica los datos de la categoría.'
          : 'Completa los campos para crear una nueva categoría.'
      }
      size="md"
    >
      <form className="p-6 flex flex-col gap-5" onSubmit={handleSubmit}>
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700" htmlFor="category-category_name">
            Nombre <span className="text-rose-500">*</span>
          </label>
          <input
            id="category-category_name"
            type="text"
            required
            placeholder="Ej: Electrónica"
            value={formData.category_name}
            onChange={handleChange}
            className="px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand text-sm text-gray-900 placeholder-gray-400"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700" htmlFor="category-description">
            Descripción
          </label>
          <textarea
            id="category-description"
            rows={3}
            placeholder="Descripción de la categoría..."
            value={formData.description}
            onChange={handleChange}
            className="px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand text-sm text-gray-900 placeholder-gray-400 resize-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700" htmlFor="category-status">
            Estado
          </label>
          <select
            id="category-status"
            value={formData.status}
            onChange={handleChange}
            className="px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand text-sm text-gray-700 bg-white"
          >
            <option value="Active">Activa</option>
            <option value="Inactive">Inactiva</option>
          </select>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
          <Button
            variant="ghost"
            type="button"
            onClick={onClose}
            icon={<X size={16} />}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button variant="primary" type="submit" icon={<Save size={16} />} disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : isEdit ? 'Guardar Cambios' : 'Crear Categoría'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
