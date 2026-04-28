import { Plus, Image as ImageIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '../../components/atoms/Button';
import { StatusBadge } from '../../components/atoms/StatusBadge';
import { PageHeader } from '../../components/molecules/PageHeader';
import { SearchInput } from '../../components/molecules/SearchInput';
import { ActionButtons } from '../../components/molecules/ActionButtons';
import { ProductForm } from '../../components/organisms/ProductForm';
import { productsService } from '../../services/products.service';

interface ProductItem {
  id: number;
  sku: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  status: string;
}

export default function ProductsList() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const loadProducts = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await productsService.getProducts();
      const formattedData: ProductItem[] = data.map((item) => ({
        id: item.id_product,
        sku: item.sku,
        name: item.product_name,
        brand: item.brand || 'N/A',
        category: item.category?.category_name || 'Sin Categoría',
        price: item.fixed_selling_price,
        status: item.status,
      }));

      setProducts(formattedData);
    } catch {
      setErrorMessage('No se pudieron cargar los productos. Reintenta en unos segundos.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProducts();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <PageHeader
        title="Catálogo de Productos"
        subtitle="Gestión de plantillas maestras y referencias SKU."
        action={
          <Button icon={<Plus size={20} />} onClick={() => setIsCreateOpen(true)}>
            Nuevo Producto
          </Button>
        }
      />

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap">
          <SearchInput placeholder="Buscar por Nombre, SKU o Marca..." className="w-full md:w-80" />
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {isLoading ? 'Cargando...' : `${products.length} productos`}
            </span>
            <button
              type="button"
              onClick={loadProducts}
              className="px-3 py-2 text-sm rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Actualizar
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="mx-4 mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 flex items-center justify-between gap-3">
            <span>{errorMessage}</span>
            <button
              type="button"
              onClick={loadProducts}
              className="px-3 py-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm">
                <th className="p-4 font-medium border-b border-gray-100 w-16">Img</th>
                <th className="p-4 font-medium border-b border-gray-100">SKU</th>
                <th className="p-4 font-medium border-b border-gray-100">Producto</th>
                <th className="p-4 font-medium border-b border-gray-100">Marca</th>
                <th className="p-4 font-medium border-b border-gray-100">Categoría</th>
                <th className="p-4 font-medium border-b border-gray-100 text-right">
                  Precio Venta
                </th>
                <th className="p-4 font-medium border-b border-gray-100">Estado</th>
                <th className="p-4 font-medium border-b border-gray-100 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm">
              {isLoading && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500">
                    Cargando productos...
                  </td>
                </tr>
              )}

              {!isLoading && !errorMessage && products.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500">
                    No hay productos para mostrar.
                  </td>
                </tr>
              )}

              {products.map((product) => (
                <tr
                  key={product.id}
                  className="hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-none"
                >
                  <td className="p-4">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200">
                      <ImageIcon size={18} />
                    </div>
                  </td>
                  <td className="p-4 font-mono text-xs text-brand font-semibold">{product.sku}</td>
                  <td className="p-4 font-medium text-gray-900">{product.name}</td>
                  <td className="p-4">{product.brand}</td>
                  <td className="p-4 text-gray-500">{product.category}</td>
                  <td className="p-4 text-right font-medium text-gray-900">
                    {product.price.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                  </td>
                  <td className="p-4">
                    <StatusBadge status={product.status} />
                  </td>
                  <td className="p-4">
                    <ActionButtons onEdit={() => setIsEditOpen(true)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-500 bg-gray-50/70">
          Vista optimizada para escritorio y scroll horizontal en pantallas pequeñas.
        </div>
      </div>

      {/* Modales */}
      <ProductForm isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} mode="create" />
      <ProductForm isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} mode="edit" />
    </div>
  );
}
