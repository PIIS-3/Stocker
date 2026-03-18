import { Plus, Edit2, Trash2, Search } from 'lucide-react';

export default function UsersList() {
  const users = [
    { id: 1, name: 'Ana López', username: 'alopez', role: 'Store_Admin', store: 'Madrid Centro', status: 'Active' },
    { id: 2, name: 'Carlos Ruíz', username: 'cruiz', role: 'Worker', store: 'Barcelona Norte', status: 'Active' },
    { id: 3, name: 'Elena García', username: 'egarcia', role: 'DB_Admin', store: 'Todas', status: 'Active' },
    { id: 4, name: 'Miguel Torres', username: 'mtorres', role: 'Worker', store: 'Valencia Playa', status: 'Inactive' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Empleados</h1>
          <p className="text-gray-500 mt-1">Gestión de usuarios y accesos al sistema.</p>
        </div>
        <button className="bg-brand text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-dark transition-colors flex items-center gap-2 shadow-sm">
          <Plus size={20} />
          Nuevo Empleado
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por nombre o usuario..." 
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
            />
          </div>
          <div className="flex gap-2">
            <select className="px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand text-sm text-gray-600 bg-white">
              <option>Todos los roles</option>
              <option>Administrador (DB)</option>
              <option>Manager de Tienda</option>
              <option>Trabajador</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm">
                <th className="p-4 font-medium border-b border-gray-100">Usuario</th>
                <th className="p-4 font-medium border-b border-gray-100">Nombre</th>
                <th className="p-4 font-medium border-b border-gray-100">Rol</th>
                <th className="p-4 font-medium border-b border-gray-100">Tienda</th>
                <th className="p-4 font-medium border-b border-gray-100">Estado</th>
                <th className="p-4 font-medium border-b border-gray-100 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-none">
                  <td className="p-4 font-medium text-gray-900">@{user.username}</td>
                  <td className="p-4">{user.name}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-medium border ${
                      user.role === 'DB_Admin' ? 'border-purple-200 text-purple-700 bg-purple-50' : 
                      user.role === 'Store_Admin' ? 'border-blue-200 text-blue-700 bg-blue-50' : 
                      'border-gray-200 text-gray-600 bg-gray-50'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4">{user.store}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {user.status === 'Active' ? 'Activo' : 'Inactivo'}
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
