import { Save, Tag, Shield, Box } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

import { Button } from '../atoms/Button';
import { Modal } from '../molecules/Modal';
import {
  productsService,
  type ProductApi,
  type ProductCreate,
} from '../../services/products.service';
import { categoriesService, type CategoryApi } from '../../services/categories.service';

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'create' | 'edit' | 'view';
  initialData?: ProductApi | null;
  onSuccess?: (action: 'create' | 'update', product: ProductApi) => void;
}

const INITIAL_STATE = {
  sku: '',
  product_name: '',
  brand: '',
  fixed_selling_price: 0,
  status: 'Active',
  category_id: 0,
};

/**
 * Componente: ProductForm
 * Formulario modal para la gestión de productos del inventario.
 * Soporta modos de creación, edición y visualización.
 */
export function ProductForm({
  isOpen,
  onClose,
  mode = 'create',
  initialData,
  onSuccess,
}: ProductFormProps) {
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [categories, setCategories] = useState<CategoryApi[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = mode === 'edit';
  const isView = mode === 'view';
  const isReadOnly = isView;

  // Cargar categorías para el selector
  useEffect(() => {
    if (isOpen) {
      void categoriesService.getCategories(0, 1000).then(setCategories);
    }
  }, [isOpen]);

  const [prevId, setPrevId] = useState<number | string | undefined>(undefined);

  // Sincronizar estado con datos iniciales (Patrón recomendado por React para evitar renders en cascada)
  const currentId = isOpen ? initialData?.id_product || 'new' : undefined;
  if (currentId !== prevId) {
    setPrevId(currentId);
    if (isOpen) {
      if ((isEdit || isView) && initialData) {
        setFormData({
          sku: initialData.sku,
          product_name: initialData.product_name,
          brand: initialData.brand || '',
          fixed_selling_price: initialData.fixed_selling_price,
          status: initialData.status,
          category_id: initialData.category_id,
        });
      } else {
        setFormData(INITIAL_STATE);
      }
      setError(null);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    const field = id.replace('product-', '');
    setFormData((prev) => ({
      ...prev,
      [field]: field === 'fixed_selling_price' || field === 'category_id' ? Number(value) : value,
    }));
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (isReadOnly) return;

      setIsLoading(true);
      setError(null);

      try {
        if (isEdit && initialData) {
          const updated = await productsService.updateProduct(initialData.id_product, formData);
          onSuccess?.('update', updated);
        } else {
          const created = await productsService.createProduct(formData as unknown as ProductCreate);
          onSuccess?.('create', created);
        }

        onClose();
      } catch (err: unknown) {
        let message = 'Error al procesar la solicitud.';
        if (err && typeof err === 'object' && 'response' in (err as object)) {
          const apiErr = err as { response: { data: { detail: string } } };
          message = apiErr.response?.data?.detail || message;
        }
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [isReadOnly, isEdit, initialData, formData, onSuccess, onClose]
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isView ? 'Detalles del Producto' : isEdit ? 'Editar Producto' : 'Nuevo Producto'}
      subtitle={
        isView
          ? 'Consulta la información técnica del producto.'
          : isEdit
            ? 'Modifica los datos del catálogo.'
            : 'Registra una nueva referencia en el inventario.'
      }
      size="lg"
    >
      <form className="p-6 flex flex-col gap-6" onSubmit={handleSubmit}>
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-sm rounded-xl animate-shake">
            {error}
          </div>
        )}

        {/* SKU + Nombre */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              className="text-xs font-semibold text-gray-500 uppercase tracking-wider pl-1"
              htmlFor="product-sku"
            >
              SKU / Código
            </label>
            <div className="relative">
              <Shield
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                id="product-sku"
                required
                readOnly={isReadOnly}
                value={formData.sku}
                onChange={handleChange}
                placeholder="Ej: SKU-ELEC-001"
                className={`pl-10 pr-4 py-2.5 w-full rounded-xl border border-gray-200 focus:outline-none text-sm ${
                  isReadOnly
                    ? 'bg-gray-50 text-gray-500 cursor-not-allowed'
                    : 'focus:ring-2 focus:ring-brand'
                }`}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              className="text-xs font-semibold text-gray-500 uppercase tracking-wider pl-1"
              htmlFor="product-product_name"
            >
              Nombre del Producto
            </label>
            <div className="relative">
              <Box className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                id="product-product_name"
                required
                readOnly={isReadOnly}
                value={formData.product_name}
                onChange={handleChange}
                placeholder='Ej: Monitor 24" LED'
                className={`pl-10 pr-4 py-2.5 w-full rounded-xl border border-gray-200 focus:outline-none text-sm ${
                  isReadOnly
                    ? 'bg-gray-50 text-gray-500 cursor-not-allowed'
                    : 'focus:ring-2 focus:ring-brand'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Marca + Categoría */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              className="text-xs font-semibold text-gray-500 uppercase tracking-wider pl-1"
              htmlFor="product-brand"
            >
              Marca
            </label>
            <input
              id="product-brand"
              readOnly={isReadOnly}
              value={formData.brand}
              onChange={handleChange}
              placeholder="Ej: LG, Samsung, Bosch..."
              className={`px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none text-sm ${
                isReadOnly
                  ? 'bg-gray-50 text-gray-500 cursor-not-allowed'
                  : 'focus:ring-2 focus:ring-brand'
              }`}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              className="text-xs font-semibold text-gray-500 uppercase tracking-wider pl-1"
              htmlFor="product-category_id"
            >
              Categoría
            </label>
            <div className="relative">
              <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <select
                id="product-category_id"
                required
                disabled={isReadOnly}
                value={formData.category_id}
                onChange={handleChange}
                className={`pl-10 pr-4 py-2.5 w-full rounded-xl border border-gray-200 focus:outline-none text-sm bg-white ${
                  isReadOnly
                    ? 'bg-gray-50 text-gray-500 cursor-not-allowed'
                    : 'focus:ring-2 focus:ring-brand'
                }`}
              >
                <option value={0} disabled>
                  Seleccionar categoría
                </option>
                {categories.map((cat) => (
                  <option key={cat.id_category} value={cat.id_category}>
                    {cat.category_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Precio + Estado */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              className="text-xs font-semibold text-gray-500 uppercase tracking-wider pl-1"
              htmlFor="product-fixed_selling_price"
            >
              Precio de Venta
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                €
              </span>
              <input
                id="product-fixed_selling_price"
                type="number"
                step="0.01"
                min="0"
                required
                readOnly={isReadOnly}
                value={formData.fixed_selling_price}
                onChange={handleChange}
                className={`pl-8 pr-4 py-2.5 w-full rounded-xl border border-gray-200 focus:outline-none text-sm ${
                  isReadOnly
                    ? 'bg-gray-50 text-gray-500 cursor-not-allowed'
                    : 'focus:ring-2 focus:ring-brand'
                }`}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              className="text-xs font-semibold text-gray-500 uppercase tracking-wider pl-1"
              htmlFor="product-status"
            >
              Estado Operativo
            </label>
            <select
              id="product-status"
              disabled={isReadOnly}
              value={formData.status}
              onChange={handleChange}
              className={`px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none text-sm bg-white ${
                isReadOnly
                  ? 'bg-gray-50 text-gray-500 cursor-not-allowed'
                  : 'focus:ring-2 focus:ring-brand'
              }`}
            >
              <option value="Active">Activo</option>
              <option value="Inactive">Inactivo</option>
            </select>
          </div>
        </div>

        {!isView && (
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <Button variant="ghost" type="button" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" isLoading={isLoading} icon={<Save size={18} />}>
              {isEdit ? 'Actualizar Producto' : 'Crear Producto'}
            </Button>
          </div>
        )}
      </form>
    </Modal>
  );
}
