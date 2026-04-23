import { Save, X } from 'lucide-react';
import { Button } from '../atoms';
import { Modal } from '../molecules';

interface CategoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'create' | 'edit';
}

export function CategoryForm({ isOpen, onClose, mode = 'create' }: CategoryFormProps) {
  const isEdit = mode === 'edit';

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
      <form className="p-6 flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
        {/* Nombre */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700" htmlFor="category-name">
            Nombre <span className="text-rose-500">*</span>
          </label>
          <input
            id="category-name"
            type="text"
            placeholder="Ej: Electrónica"
            defaultValue={isEdit ? 'Electrónica' : ''}
            className="px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand text-sm text-gray-900 placeholder-gray-400"
          />
        </div>

        {/* Descripción */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700" htmlFor="category-description">
            Descripción
          </label>
          <textarea
            id="category-description"
            rows={3}
            placeholder="Descripción de la categoría..."
            defaultValue={isEdit ? 'Dispositivos, cables y accesorios tech.' : ''}
            className="px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand text-sm text-gray-900 placeholder-gray-400 resize-none"
          />
        </div>

        {/* Estado */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700" htmlFor="category-status">
            Estado
          </label>
          <select
            id="category-status"
            className="px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand text-sm text-gray-700 bg-white"
            defaultValue="Active"
          >
            <option value="Active">Activa</option>
            <option value="Inactive">Inactiva</option>
          </select>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
          <Button variant="ghost" type="button" onClick={onClose} icon={<X size={16} />}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" icon={<Save size={16} />}>
            {isEdit ? 'Guardar Cambios' : 'Crear Categoría'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
