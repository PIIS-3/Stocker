import { Save, X } from 'lucide-react';
import { Button } from '../atoms';
import { Modal } from '../molecules';

interface StoreFormProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'create' | 'edit';
}

export function StoreForm({ isOpen, onClose, mode = 'create' }: StoreFormProps) {
  const isEdit = mode === 'edit';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Editar Tienda' : 'Nueva Tienda'}
      subtitle={isEdit ? 'Modifica los datos de la sucursal.' : 'Registra una nueva sucursal o punto de venta.'}
      size="md"
    >
      <form className="p-6 flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>

        {/* Nombre */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700" htmlFor="store-name">
            Nombre de la Tienda <span className="text-rose-500">*</span>
          </label>
          <input
            id="store-name"
            type="text"
            placeholder="Ej: Madrid Centro"
            defaultValue={isEdit ? 'Madrid Centro' : ''}
            className="px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand text-sm text-gray-900 placeholder-gray-400"
          />
        </div>

        {/* Dirección */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700" htmlFor="store-address">
            Dirección <span className="text-rose-500">*</span>
          </label>
          <input
            id="store-address"
            type="text"
            placeholder="Ej: Gran Vía 12, Madrid"
            defaultValue={isEdit ? 'Gran Vía 12, Madrid' : ''}
            className="px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand text-sm text-gray-900 placeholder-gray-400"
          />
        </div>

        {/* Ciudad + Código Postal */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700" htmlFor="store-city">
              Ciudad
            </label>
            <input
              id="store-city"
              type="text"
              placeholder="Ej: Madrid"
              defaultValue={isEdit ? 'Madrid' : ''}
              className="px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand text-sm text-gray-900 placeholder-gray-400"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700" htmlFor="store-zip">
              Código Postal
            </label>
            <input
              id="store-zip"
              type="text"
              placeholder="Ej: 28013"
              defaultValue={isEdit ? '28013' : ''}
              className="px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand text-sm text-gray-900 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Estado */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700" htmlFor="store-status">
            Estado
          </label>
          <select
            id="store-status"
            className="px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand text-sm text-gray-700 bg-white"
            defaultValue={isEdit ? 'Active' : 'Active'}
          >
            <option value="Active">Activa</option>
            <option value="Inactive">Inactiva</option>
          </select>
        </div>

        {/* Notas */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700" htmlFor="store-notes">
            Notas adicionales
          </label>
          <textarea
            id="store-notes"
            rows={2}
            placeholder="Horario, observaciones..."
            defaultValue={isEdit ? 'Tienda principal, abierta L-D 9:00-21:00.' : ''}
            className="px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand text-sm text-gray-900 placeholder-gray-400 resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
          <Button variant="ghost" type="button" onClick={onClose} icon={<X size={16} />}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" icon={<Save size={16} />}>
            {isEdit ? 'Guardar Cambios' : 'Crear Tienda'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
