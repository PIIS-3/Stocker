import { Save, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useForm } from '@tanstack/react-form';
import { Button } from '../atoms/Button';
import { Modal } from '../molecules/Modal';
import {
  useCreateCategory,
  useUpdateCategory,
} from '../../queries/categories.queries';
import type { CategoryCreate, CategoryApi } from '../../services/categories.service';

type CategoryFormAction = 'create' | 'update';

interface CategoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'create' | 'edit' | 'view';
  initialData?: CategoryApi | null;
  onSuccess?: (action: CategoryFormAction, category: CategoryApi) => void;
  onError?: (message: string) => void;
}

const INITIAL_STATE: CategoryCreate = {
  category_name: '',
  description: '',
  status: 'Active',
};

/**
 * Componente: CategoryForm
 * Formulario modal para crear, editar o visualizar una categoría de productos.
 * Utiliza TanStack Form para la gestión del estado y validaciones.
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
  const isView = mode === 'view';
  const isReadOnly = isView;

  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: INITIAL_STATE,
    onSubmit: async ({ value }) => {
      if (isReadOnly) return;
      setError(null);

      try {
        const action: CategoryFormAction = isEdit ? 'update' : 'create';
        let savedCategory: CategoryApi;

        if (isEdit && initialData) {
          savedCategory = await updateMutation.mutateAsync({
            id: initialData.id_category,
            data: value,
          });
        } else {
          savedCategory = await createMutation.mutateAsync(value);
        }

        onSuccess?.(action, savedCategory);
        onClose();
      } catch (err: unknown) {
        const message = (() => {
          const detail =
            typeof err === 'object' && err !== null && 'response' in err
              ? (err as { response?: { data?: { detail?: unknown } } }).response?.data?.detail
              : undefined;

          if (typeof detail === 'string') return detail;
          return 'Ocurrió un error al guardar la categoría.';
        })();

        setError(message);
        onError?.(message);
      }
    },
  });

  // Sincronizar datos cuando el modal se abre o cambian los datos iniciales
  useEffect(() => {
    if (isOpen) {
      if ((isEdit || isView) && initialData) {
        form.reset({
          category_name: initialData.category_name,
          description: initialData.description || '',
          status: initialData.status,
        });
      } else {
        form.reset(INITIAL_STATE);
      }
      setError(null);
    }
  }, [isOpen, initialData, isEdit, isView, form]);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const modalTitle = isView
    ? 'Detalles de la Categoría'
    : isEdit
      ? 'Editar Categoría'
      : 'Nueva Categoría';
  const modalSubtitle = isView
    ? 'Información detallada de la clasificación.'
    : isEdit
      ? 'Modifica los datos de la categoría.'
      : 'Organiza tus productos creando una nueva categoría.';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} subtitle={modalSubtitle} size="md">
      <form
        className="p-6 flex flex-col gap-5"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Nombre y Estado */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {initialData && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">ID</label>
              <input
                type="text"
                readOnly
                value={`#${initialData.id_category}`}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 text-gray-500 font-mono outline-none"
              />
            </div>
          )}

          <form.Field
            name="category_name"
            validators={{
              onChange: ({ value }) => !value ? 'El nombre es requerido' : undefined,
            }}
            children={(field) => (
              <div className={`flex flex-col gap-1.5 ${initialData ? 'sm:col-span-2' : 'sm:col-span-3'}`}>
                <label className="text-sm font-medium text-gray-700" htmlFor={field.name}>
                  Nombre de Categoría {!isReadOnly && <span className="text-rose-500">*</span>}
                </label>
                <input
                  id={field.name}
                  name={field.name}
                  type="text"
                  readOnly={isReadOnly}
                  placeholder="Ej: Electrónica"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className={`px-4 py-2.5 rounded-xl border focus:outline-none text-sm text-gray-900 placeholder-gray-400 ${
                    field.state.meta.errors.length > 0 ? 'border-rose-300 ring-1 ring-rose-300' : 'border-gray-200'
                  } ${
                    isReadOnly ? 'bg-gray-50 cursor-not-allowed' : 'focus:ring-2 focus:ring-brand'
                  }`}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-xs text-rose-500 mt-1">{field.state.meta.errors[0]}</p>
                )}
              </div>
            )}
          />

          <form.Field
            name="status"
            children={(field) => (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700" htmlFor={field.name}>
                  Estado
                </label>
                <select
                  id={field.name}
                  name={field.name}
                  disabled={isReadOnly}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className={`px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none text-sm text-gray-700 bg-white ${
                    isReadOnly ? 'bg-gray-50 cursor-not-allowed' : 'focus:ring-2 focus:ring-brand'
                  }`}
                >
                  <option value="Active">Activa</option>
                  <option value="Inactive">Inactiva</option>
                </select>
              </div>
            )}
          />
        </div>

        {/* Descripción */}
        <form.Field
          name="description"
          children={(field) => (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700" htmlFor={field.name}>
                Descripción
              </label>
              <textarea
                id={field.name}
                name={field.name}
                rows={3}
                readOnly={isReadOnly}
                placeholder="Breve descripción de los productos incluidos..."
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className={`px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none text-sm text-gray-900 placeholder-gray-400 resize-none ${
                  isReadOnly ? 'bg-gray-50 cursor-not-allowed' : 'focus:ring-2 focus:ring-brand'
                }`}
              />
            </div>
          )}
        />

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
          <Button
            variant="ghost"
            type="button"
            onClick={onClose}
            icon={isView ? undefined : <X size={16} />}
            disabled={isSubmitting}
          >
            {isView ? 'Cerrar' : 'Cancelar'}
          </Button>
          {!isView && (
            <Button
              variant="primary"
              type="submit"
              isLoading={isSubmitting}
              icon={<Save size={16} />}
            >
              {isEdit ? 'Guardar Cambios' : 'Crear Categoría'}
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
}
