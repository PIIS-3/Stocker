import { Plus, Edit2, Trash2, Search } from 'lucide-react';

export default function CategoriesList() {
  const categories = [
    { id: 1, name: 'Electrónica', description: 'Dispositivos, cables y accesorios tech', status: 'Active' },
    { id: 2, name: 'Ropa Deportiva', description: 'Indumentaria para actividades físicas', status: 'Active' },
    { id: 3, name: 'Hogar', description: 'Muebles y decoración', status: 'Inactive' },
    { id: 4, name: 'Alimentación', description: 'Productos no perecederos', status: 'Active' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categorías</h1>
          <p className="text-gray-500 mt-1">Clasificación para el catálogo de productos.</p>
        </div>
        <button className="bg-brand text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-dark transition-colors flex items-center gap-2 shadow-sm">
          <Plus size={20} />
          Crear Categoría
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar categoría..." 
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm">
                <th className="p-4 font-medium border-b border-gray-100">ID</th>
                <th className="p-4 font-medium border-b border-gray-100">Nombre</th>
                <th className="p-4 font-medium border-b border-gray-100">Descripción</th>
                <th className="p-4 font-medium border-b border-gray-100">Estado</th>
                <th className="p-4 font-medium border-b border-gray-100 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-none">
                  <td className="p-4">#{category.id}</td>
                  <td className="p-4 font-medium text-gray-900">{category.name}</td>
                  <td className="p-4 max-w-xs truncate">{category.description}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      category.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {category.status === 'Active' ? 'Activa' : 'Inactiva'}
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
