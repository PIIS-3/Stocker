import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../components/atoms/Button';
import { StatusBadge } from '../../components/atoms/StatusBadge';
import { RoleBadge } from '../../components/atoms/RoleBadge';
import { PageHeader } from '../../components/molecules/PageHeader';
import { SearchInput } from '../../components/molecules/SearchInput';
import { ActionButtons } from '../../components/molecules/ActionButtons';
import { UserForm } from '../../components/organisms/UserForm';

export default function UsersList() {
  const users = [
    {
      id: 1,
      name: 'Ana López',
      username: 'alopez',
      role: 'Store_Admin',
      store: 'Madrid Centro',
      status: 'Active',
    },
    {
      id: 2,
      name: 'Carlos Ruíz',
      username: 'cruiz',
      role: 'Worker',
      store: 'Barcelona Norte',
      status: 'Active',
    },
    {
      id: 3,
      name: 'Elena García',
      username: 'egarcia',
      role: 'DB_Admin',
      store: 'Todas',
      status: 'Active',
    },
    {
      id: 4,
      name: 'Miguel Torres',
      username: 'mtorres',
      role: 'Worker',
      store: 'Valencia Playa',
      status: 'Inactive',
    },
  ];

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <PageHeader
        title="Empleados"
        subtitle="Gestión de usuarios y accesos al sistema."
        action={
          <Button icon={<Plus size={20} />} onClick={() => setIsCreateOpen(true)}>
            Nuevo Empleado
          </Button>
        }
      />

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap">
          <SearchInput placeholder="Buscar por nombre o usuario..." className="w-full md:w-72" />
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
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-none"
                >
                  <td className="p-4 font-medium text-gray-900">@{user.username}</td>
                  <td className="p-4">{user.name}</td>
                  <td className="p-4">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="p-4">{user.store}</td>
                  <td className="p-4">
                    <StatusBadge status={user.status} />
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
      <UserForm isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} mode="create" />
      <UserForm isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} mode="edit" />
    </div>
  );
}
