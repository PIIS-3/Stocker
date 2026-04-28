import { Save, X } from 'lucide-react';
import { Button } from '../atoms/Button';
import { Modal } from '../molecules/Modal';

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'create' | 'edit';
}

/**
 * Componente: ProductForm
 * Formulario modal para la gestión de productos del inventario.
 * Incluye campos para SKU, marca, precio y categoría.
 */
export function ProductForm({ isOpen, onClose, mode = 'create' }: ProductFormProps) {
  const isEdit = mode === 'edit';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Editar Producto' : 'Nuevo Producto'}
      subtitle={
        isEdit
          ? 'Modifica los datos del producto.'
          : 'Completa la información para registrar un nuevo producto.'
      }
      size="lg"
    >
      <form className="p-6 flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
        {/* SKU + Nombre */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700" htmlFor="product-sku">
              SKU <span className="text-rose-500">*</span>
            </label>
            <input
              id="product-sku"
              type="text"
              placeholder="Ej: SKU-ELEC-001"
              defaultValue={isEdit ? 'SKU-ELEC-001' : ''}
              className="px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand text-sm text-gray-900 placeholder-gray-400"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700" htmlFor="product-name">
              Nombre del Producto <span className="text-rose-500">*</span>
            </label>
            <input
              id="product-name"
              type="text"
              placeholder="Ej: Smartphone Pro X"
              defaultValue={isEdit ? 'Smartphone Pro X' : ''}
              className="px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand text-sm text-gray-900 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Marca + Categoría */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700" htmlFor="product-brand">
              Marca
            </label>
            <input
              id="product-brand"
              type="text"
              placeholder="Ej: TechNova"
              defaultValue={isEdit ? 'TechNova' : ''}
              className="px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand text-sm text-gray-900 placeholder-gray-400"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700" htmlFor="product-category">
              Categoría <span className="text-rose-500">*</span>
            </label>
            <select
              id="product-category"
              className="px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand text-sm text-gray-700 bg-white"
              defaultValue={isEdit ? 'Electrónica' : ''}
            >
              <option value="" disabled>
                Seleccionar categoría
              </option>
              <option>Electrónica</option>
              <option>Ropa Deportiva</option>
              <option>Hogar</option>
              <option>Alimentación</option>
            </select>
          </div>
        </div>

        {/* Precio + Estado */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700" htmlFor="product-price">
              Precio de Venta (€) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                €
              </span>
              <input
                id="product-price"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                defaultValue={isEdit ? '899.99' : ''}
                className="pl-8 pr-4 py-2.5 w-full rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand text-sm text-gray-900 placeholder-gray-400"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700" htmlFor="product-status">
              Estado
            </label>
            <select
              id="product-status"
              className="px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand text-sm text-gray-700 bg-white"
              defaultValue="Active"
            >
              <option value="Active">Activo</option>
              <option value="Inactive">Inactivo</option>
            </select>
          </div>
        </div>

        {/* Descripción */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700" htmlFor="product-description">
            Descripción
          </label>
          <textarea
            id="product-description"
            rows={3}
            placeholder="Descripción breve del producto..."
            defaultValue={isEdit ? 'Smartphone de última generación con pantalla AMOLED y 5G.' : ''}
            className="px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand text-sm text-gray-900 placeholder-gray-400 resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
          <Button variant="ghost" type="button" onClick={onClose} icon={<X size={16} />}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" icon={<Save size={16} />}>
            {isEdit ? 'Guardar Cambios' : 'Crear Producto'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
