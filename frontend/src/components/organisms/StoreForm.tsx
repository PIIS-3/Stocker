import { Save, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useForm } from '@tanstack/react-form';
import { Button } from '../atoms/Button';
import { Modal } from '../molecules/Modal';
import {
  useCreateStore,
  useUpdateStore,
} from '../../queries/stores.queries';
import type { StoreCreate, StoreApi } from '../../services/stores.service';

type StoreFormAction = 'create' | 'update';

interface StoreFormProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'create' | 'edit' | 'view';
  initialData?: StoreApi | null;
  onSuccess?: (action: StoreFormAction, store: StoreApi) => void;
  onError?: (message: string) => void;
}

const INITIAL_STATE: StoreCreate = {
  store_name: '',
  address: '',
  status: 'Active',
};

/**
 * Componente: StoreForm
 * Formulario modal para crear, editar o visualizar una tienda física.
 * Utiliza TanStack Form para la gestión del estado y validaciones.
 */
export function StoreForm({
  isOpen,
  onClose,
  mode = 'create',
  initialData,
  onSuccess,
  onError,
}: StoreFormProps) {
  const isEdit = mode === 'edit';
  const isView = mode === 'view';
  const isReadOnly = isView;

  const createMutation = useCreateStore();
  const updateMutation = useUpdateStore();
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: INITIAL_STATE,
    onSubmit: async ({ value }) => {
      if (isReadOnly) return;
      setError(null);

      try {
        const action: StoreFormAction = isEdit ? 'update' : 'create';
        let savedStore: StoreApi;

        if (isEdit && initialData) {
          savedStore = await updateMutation.mutateAsync({
            id: initialData.id_store,
            data: value,
          });
        } else {
          savedStore = await createMutation.mutateAsync(value);
        }

        onSuccess?.(action, savedStore);
        onClose();
      } catch (err: unknown) {
        const message = (() => {
          const detail =
            typeof err === 'object' && err !== null && 'response' in err
              ? (err as { response?: { data?: { detail?: unknown } } }).response?.data?.detail
              : undefined;

          if (typeof detail === 'string') return detail;
          return 'Ocurrió un error al guardar la tienda.';
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
          store_name: initialData.store_name,
          address: initialData.address,
          status: initialData.status,
        });
      } else {
        form.reset(INITIAL_STATE);
      }
      setError(null);
    }
  }, [isOpen, initialData, isEdit, isView, form]);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const modalTitle = isView ? 'Detalles de la Tienda' : isEdit ? 'Editar Tienda' : 'Nueva Tienda';
  const modalSubtitle = isView
    ? 'Información de la sucursal seleccionada.'
    : isEdit
      ? 'Modifica los datos de la sucursal.'
      : 'Registra una nueva sucursal o punto de venta.';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} subtitle={modalSubtitle} size="lg">
      <form
        className="p-5 sm:p-6 flex flex-col gap-4 sm:gap-5"
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

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {initialData && (
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">ID</label>
              <input
                type="text"
                readOnly
                value={`#${initialData.id_store}`}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 text-gray-500 font-mono outline-none w-full"
              />
            </div>
          )}

          <form.Field
            name="store_name"
            validators={{
              onChange: ({ value }) => !value ? 'El nombre es requerido' : undefined,
            }}
            children={(field) => (
              <div className={`flex flex-col gap-1.5 ${initialData ? 'md:col-span-10' : 'md:col-span-6'}`}>
                <label className="text-sm font-medium text-gray-700" htmlFor={field.name}>
                  Nombre de la Tienda {!isReadOnly && <span className="text-rose-500">*</span>}
                </label>
                <input
                  id={field.name}
                  name={field.name}
                  type="text"
                  readOnly={isReadOnly}
                  placeholder="Ej: Madrid Centro"
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
              <div className="flex flex-col gap-1.5 md:col-span-6">
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

        {/* Dirección */}
        <form.Field
          name="address"
          validators={{
            onChange: ({ value }) => !value ? 'La dirección es requerida' : undefined,
          }}
          children={(field) => (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700" htmlFor={field.name}>
                Dirección {!isReadOnly && <span className="text-rose-500">*</span>}
              </label>
              <input
                id={field.name}
                name={field.name}
                type="text"
                readOnly={isReadOnly}
                placeholder="Ej: Gran Vía 12, Madrid"
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
              icon={<Save size={16} />}
              isLoading={isSubmitting}
            >
              {isEdit ? 'Guardar Cambios' : 'Crear Tienda'}
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
}
