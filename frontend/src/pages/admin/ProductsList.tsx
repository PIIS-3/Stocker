import { Plus, Image as ImageIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button, StatusBadge } from '../../components/atoms';
import { PageHeader, SearchInput, ActionButtons } from '../../components/molecules';
import { ProductForm } from '../../components/organisms/ProductForm';

interface ProductItem {
  id: number;
  sku: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  status: string;
}

interface ApiProduct {
  id_product: number;
  sku: string;
  product_name: string;
  brand: string | null;
  category: { category_name: string } | null;
  fixed_selling_price: number;
  status: string;
}

export default function ProductsList() {
  const [products, setProducts] = useState<ProductItem[]>([
    { id: 1, sku: 'SKU-ELEC-001', name: 'Smartphone Pro X', brand: 'TechNova', category: 'Electrónica', price: 899.99, status: 'Active' },
    { id: 2, sku: 'SKU-ELEC-002', name: 'Auriculares Inalámbricos', brand: 'SoundWave', category: 'Electrónica', price: 129.50, status: 'Active' },
    { id: 3, sku: 'SKU-ROPA-001', name: 'Camiseta Running Dry', brand: 'FastTrack', category: 'Ropa Deportiva', price: 29.90, status: 'Active' },
    { id: 4, sku: 'SKU-HOG-001', name: 'Lámpara de Escritorio LED', brand: 'Lumina', category: 'Hogar', price: 45.00, status: 'Inactive' },
  ]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Hacer la petición a FastAPI cuando se monta el componente
  useEffect(() => {
    fetch('http://localhost:8000/api/products')
      .then(res => res.json())
      .then(data => {
        // Si la BD devolvió algo, machacamos los datos de prueba harcodeados
        if (data && data.length > 0) {
          const formattedData = data.map((item: ApiProduct) => ({
            id: item.id_product,
            sku: item.sku,
            name: item.product_name,
            brand: item.brand || 'N/A',
            category: item.category?.category_name || 'Sin Categoría',
            price: item.fixed_selling_price,
            status: item.status
          }));
          setProducts(formattedData);
        }
      })
      .catch(err => console.error("Error conectando con la API:", err));
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
          <SearchInput
            placeholder="Buscar por Nombre, SKU o Marca..."
            className="w-full md:w-80"
          />
          <div className="flex gap-2">
            <select className="px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand text-sm text-gray-600 bg-white">
              <option>Todas las categorías</option>
              <option>Electrónica</option>
              <option>Ropa Deportiva</option>
              <option>Hogar</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm">
                <th className="p-4 font-medium border-b border-gray-100 w-16">Img</th>
                <th className="p-4 font-medium border-b border-gray-100">SKU</th>
                <th className="p-4 font-medium border-b border-gray-100">Producto</th>
                <th className="p-4 font-medium border-b border-gray-100">Marca</th>
                <th className="p-4 font-medium border-b border-gray-100">Categoría</th>
                <th className="p-4 font-medium border-b border-gray-100 text-right">Precio Venta</th>
                <th className="p-4 font-medium border-b border-gray-100">Estado</th>
                <th className="p-4 font-medium border-b border-gray-100 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-none">
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
      </div>

      {/* Modales */}
      <ProductForm isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} mode="create" />
      <ProductForm isOpen={isEditOpen}   onClose={() => setIsEditOpen(false)}   mode="edit" />
    </div>
  );
}
