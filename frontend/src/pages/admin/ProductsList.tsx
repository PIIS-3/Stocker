import { Plus, Edit2, Trash2, Search, Image as ImageIcon } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ProductsList() {
  const [products, setProducts] = useState<any[]>([
    { id: 1, sku: 'SKU-ELEC-001', name: 'Smartphone Pro X', brand: 'TechNova', category: 'Electrónica', price: 899.99, status: 'Active' },
    { id: 2, sku: 'SKU-ELEC-002', name: 'Auriculares Inalámbricos', brand: 'SoundWave', category: 'Electrónica', price: 129.50, status: 'Active' },
    { id: 3, sku: 'SKU-ROPA-001', name: 'Camiseta Running Dry', brand: 'FastTrack', category: 'Ropa Deportiva', price: 29.90, status: 'Active' },
    { id: 4, sku: 'SKU-HOG-001', name: 'Lámpara de Escritorio LED', brand: 'Lumina', category: 'Hogar', price: 45.00, status: 'Inactive' },
  ]);

  // Hacer la petición a FastAPI cuando se monta el componente
  useEffect(() => {
    fetch('http://localhost:8000/api/products')
      .then(res => res.json())
      .then(data => {
        console.log("🚀 Datos reales desde PostgreSQL/FastAPI (localhost:8000):", data);
        
        // Si la BD devolvió algo, machacamos los datos de prueba harcodeados
        if (data && data.length > 0) {
          const formattedData = data.map((item: any) => ({
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Catálogo de Productos</h1>
          <p className="text-gray-500 mt-1">Gestión de plantillas maestras y referencias SKU.</p>
        </div>
        <button className="bg-brand text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-dark transition-colors flex items-center gap-2 shadow-sm">
          <Plus size={20} />
          Nuevo Producto
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por Nombre, SKU o Marca..." 
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
            />
          </div>
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
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      product.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {product.status === 'Active' ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="p-4 flex items-center justify-end gap-2">
                    <button className="p-2 text-gray-400 hover:text-brand transition-colors rounded-lg hover:bg-brand/10">
                      <Edit2 size={18} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-rose-600 transition-colors rounded-lg hover:bg-rose-50">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
