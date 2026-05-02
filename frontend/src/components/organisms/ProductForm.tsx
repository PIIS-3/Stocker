import { Save, Tag, Shield, Box } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useForm } from '@tanstack/react-form';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../atoms/Button';
import { Modal } from '../molecules/Modal';
import { useCreateProduct, useUpdateProduct } from '../../queries/products.queries';
import { categoriesListOptions } from '../../queries/categories.queries';
import type { ProductApi, ProductCreate } from '../../services/products.service';

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
  const [error, setError] = useState<string | null>(null);

  const isEdit = mode === 'edit';
  const isView = mode === 'view';
  const isReadOnly = isView;

  // ── Configuración de TanStack Form ──
  const form = useForm({
    defaultValues: INITIAL_STATE,
    onSubmit: async ({ value }) => {
      if (isReadOnly) return;
      setError(null);

      try {
        let savedProduct: ProductApi;
        if (isEdit && initialData) {
          savedProduct = await updateMutation.mutateAsync({
            id: initialData.id_product,
            data: value,
          });
          onSuccess?.('update', savedProduct);
        } else {
          savedProduct = await createMutation.mutateAsync(value as unknown as ProductCreate);
          onSuccess?.('create', savedProduct);
        }
        onClose();
      } catch (err: unknown) {
        let message = 'Error al procesar la solicitud.';
        if (err && typeof err === 'object' && 'response' in (err as object)) {
          const apiErr = err as { response: { data: { detail: string } } };
          message = apiErr.response?.data?.detail || message;
        }
        setError(message);
      }
    },
  });

  // Cargar categorías para el selector usando TanStack Query
  const { data: categories = [] } = useQuery({
    ...categoriesListOptions(0, 1000),
    enabled: isOpen,
  });

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  // ── Sincronización de Datos Iniciales ──
  useEffect(() => {
    if (isOpen) {
      if ((isEdit || isView) && initialData) {
        form.reset({
          sku: initialData.sku,
          product_name: initialData.product_name,
          brand: initialData.brand || '',
          fixed_selling_price: initialData.fixed_selling_price,
          status: initialData.status,
          category_id: initialData.category_id,
        });
      } else {
        form.reset(INITIAL_STATE);
      }
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError(null);
    }
  }, [isOpen, initialData, isEdit, isView, form]);

  const isLoading = createMutation.isPending || updateMutation.isPending;

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
      <form
        className="p-6 flex flex-col gap-6"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
      >
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-sm rounded-xl animate-shake">
            {error}
          </div>
        )}

        {/* ID + SKU + Nombre */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          {initialData && (
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider pl-1">
                ID
              </label>
              <input
                type="text"
                readOnly
                value={`#${initialData.id_product}`}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 text-gray-500 font-mono outline-none w-full"
              />
            </div>
          )}
          <div
            className={`flex flex-col gap-1.5 ${initialData ? 'sm:col-span-4' : 'sm:col-span-6'}`}
          >
            <label
              className="text-xs font-semibold text-gray-500 uppercase tracking-wider pl-1"
              htmlFor="product-sku"
            >
              SKU / Código
            </label>
            <form.Field
              name="sku"
              validators={{
                onChange: ({ value }) => (!value ? 'El SKU es requerido' : undefined),
              }}
              children={(field) => (
                <div className="relative">
                  <Shield
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                  <input
                    id={field.name}
                    name={field.name}
                    required
                    readOnly={isReadOnly}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Ej: SKU-ELEC-001"
                    className={`pl-10 pr-4 py-2.5 w-full rounded-xl border border-gray-200 focus:outline-none text-sm ${
                      isReadOnly
                        ? 'bg-gray-50 text-gray-500 cursor-not-allowed'
                        : 'focus:ring-2 focus:ring-brand'
                    }`}
                  />
                  {field.state.meta.errors ? (
                    <em className="text-[10px] text-rose-500 absolute -bottom-4 left-1 font-medium">
                      {field.state.meta.errors.join(', ')}
                    </em>
                  ) : null}
                </div>
              )}
            />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-6">
            <label
              className="text-xs font-semibold text-gray-500 uppercase tracking-wider pl-1"
              htmlFor="product-product_name"
            >
              Nombre del Producto
            </label>
            <form.Field
              name="product_name"
              validators={{
                onChange: ({ value }) => (!value ? 'El nombre es requerido' : undefined),
              }}
              children={(field) => (
                <div className="relative">
                  <Box
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                  <input
                    id={field.name}
                    name={field.name}
                    required
                    readOnly={isReadOnly}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder='Ej: Monitor 24" LED'
                    className={`pl-10 pr-4 py-2.5 w-full rounded-xl border border-gray-200 focus:outline-none text-sm ${
                      isReadOnly
                        ? 'bg-gray-50 text-gray-500 cursor-not-allowed'
                        : 'focus:ring-2 focus:ring-brand'
                    }`}
                  />
                  {field.state.meta.errors ? (
                    <em className="text-[10px] text-rose-500 absolute -bottom-4 left-1 font-medium">
                      {field.state.meta.errors.join(', ')}
                    </em>
                  ) : null}
                </div>
              )}
            />
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
            <form.Field
              name="brand"
              children={(field) => (
                <input
                  id={field.name}
                  name={field.name}
                  readOnly={isReadOnly}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Ej: LG, Samsung, Bosch..."
                  className={`px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none text-sm ${
                    isReadOnly
                      ? 'bg-gray-50 text-gray-500 cursor-not-allowed'
                      : 'focus:ring-2 focus:ring-brand'
                  }`}
                />
              )}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              className="text-xs font-semibold text-gray-500 uppercase tracking-wider pl-1"
              htmlFor="product-category_id"
            >
              Categoría
            </label>
            <form.Field
              name="category_id"
              validators={{
                onChange: ({ value }) => (value === 0 ? 'La categoría es requerida' : undefined),
              }}
              children={(field) => (
                <div className="relative">
                  <Tag
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                  <select
                    id={field.name}
                    name={field.name}
                    required
                    disabled={isReadOnly}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
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
                  {field.state.meta.errors ? (
                    <em className="text-[10px] text-rose-500 absolute -bottom-4 left-1 font-medium">
                      {field.state.meta.errors.join(', ')}
                    </em>
                  ) : null}
                </div>
              )}
            />
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
            <form.Field
              name="fixed_selling_price"
              validators={{
                onChange: ({ value }) =>
                  value < 0 ? 'El precio no puede ser negativo' : undefined,
              }}
              children={(field) => (
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                    €
                  </span>
                  <input
                    id={field.name}
                    name={field.name}
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    readOnly={isReadOnly}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                    className={`pl-8 pr-4 py-2.5 w-full rounded-xl border border-gray-200 focus:outline-none text-sm ${
                      isReadOnly
                        ? 'bg-gray-50 text-gray-500 cursor-not-allowed'
                        : 'focus:ring-2 focus:ring-brand'
                    }`}
                  />
                  {field.state.meta.errors ? (
                    <em className="text-[10px] text-rose-500 absolute -bottom-4 left-1 font-medium">
                      {field.state.meta.errors.join(', ')}
                    </em>
                  ) : null}
                </div>
              )}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              className="text-xs font-semibold text-gray-500 uppercase tracking-wider pl-1"
              htmlFor="product-status"
            >
              Estado Operativo
            </label>
            <form.Field
              name="status"
              children={(field) => (
                <select
                  id={field.name}
                  name={field.name}
                  disabled={isReadOnly}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className={`px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none text-sm bg-white ${
                    isReadOnly
                      ? 'bg-gray-50 text-gray-500 cursor-not-allowed'
                      : 'focus:ring-2 focus:ring-brand'
                  }`}
                >
                  <option value="Active">Activo</option>
                  <option value="Inactive">Inactivo</option>
                </select>
              )}
            />
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
