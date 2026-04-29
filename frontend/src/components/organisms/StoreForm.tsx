import { Save, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '../atoms/Button';
import { Modal } from '../molecules/Modal';
import { storesService } from '../../services/stores.service';
import type { StoreCreate, StoreApi } from '../../services/stores.service';

type StoreFormAction = 'create' | 'update';

interface StoreFormProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'create' | 'edit';
  initialData?: StoreApi | null;
  onSuccess?: (action: StoreFormAction, store: StoreApi) => void;
  onError?: (message: string) => void;
}

/**
 * Componente: StoreForm
 * Formulario modal para crear o editar una tienda física.
 * Maneja el estado local del formulario, validaciones básicas y llamadas al servicio de tiendas.
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

  const createInitialFormData = (): StoreCreate => {
    if (isEdit && initialData) {
      return {
        store_name: initialData.store_name,
        address: initialData.address,
        status: initialData.status,
      };
    }

    return {
      store_name: '',
      address: '',
      status: 'Active',
    };
  };

  const [formData, setFormData] = useState<StoreCreate>(createInitialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sincronizar datos cuando el modal se abre o cambian los datos iniciales
  useEffect(() => {
    if (isOpen) {
      setFormData(createInitialFormData());
      setError(null);
    }
  }, [isOpen, initialData]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    const name = id.replace('store-', '');
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const action: StoreFormAction = isEdit ? 'update' : 'create';
      let savedStore: StoreApi;

      if (isEdit && initialData) {
        savedStore = await storesService.updateStore(initialData.id_store, formData);
      } else {
        savedStore = await storesService.createStore(formData);
      }

      onSuccess?.(action, savedStore);
      onClose();
    } catch (err: unknown) {
      const message = (() => {
        const detail =
          typeof err === 'object' && err !== null && 'response' in err
            ? (err as { response?: { data?: { detail?: unknown } } }).response?.data?.detail
            : undefined;

        if (typeof detail === 'string') {
          return detail;
        }

        return 'Ocurrió un error al guardar la tienda.';
      })();

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
      title={isEdit ? 'Editar Tienda' : 'Nueva Tienda'}
      subtitle={
        isEdit
          ? 'Modifica los datos de la sucursal.'
          : 'Registra una nueva sucursal o punto de venta.'
      }
      size="lg"
    >
      <form className="p-5 sm:p-6 flex flex-col gap-4 sm:gap-5" onSubmit={handleSubmit}>
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700" htmlFor="store-store_name">
              Nombre de la Tienda <span className="text-rose-500">*</span>
            </label>
            <input
              id="store-store_name"
              type="text"
              required
              placeholder="Ej: Madrid Centro"
              value={formData.store_name}
              onChange={handleChange}
              className="px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand text-sm text-gray-900 placeholder-gray-400"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700" htmlFor="store-status">
              Estado
            </label>
            <select
              id="store-status"
              value={formData.status}
              onChange={handleChange}
              className="px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand text-sm text-gray-700 bg-white"
            >
              <option value="Active">Activa</option>
              <option value="Inactive">Inactiva</option>
            </select>
          </div>
        </div>

        {/* Dirección */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700" htmlFor="store-address">
            Dirección <span className="text-rose-500">*</span>
          </label>
          <input
            id="store-address"
            type="text"
            required
            placeholder="Ej: Gran Vía 12, Madrid"
            value={formData.address}
            onChange={handleChange}
            className="px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand text-sm text-gray-900 placeholder-gray-400"
          />
        </div>

        {/* Actions */}
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
            {isSubmitting ? 'Guardando...' : isEdit ? 'Guardar Cambios' : 'Crear Tienda'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
