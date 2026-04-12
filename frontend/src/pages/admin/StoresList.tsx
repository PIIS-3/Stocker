import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Button, StatusBadge } from '../../components/atoms';
import { PageHeader, SearchInput, ActionButtons } from '../../components/molecules';
import { StoreForm } from '../../components/organisms/StoreForm';

export default function StoresList() {
  const stores = [
    { id: 1, name: 'Madrid Centro', address: 'Gran Vía 12, Madrid', status: 'Active' },
    { id: 2, name: 'Barcelona Norte', address: 'Diagonal 45, Barcelona', status: 'Active' },
    { id: 3, name: 'Valencia Playa', address: 'Avenida Neptuno 3, Valencia', status: 'Inactive' },
  ];

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <PageHeader
        title="Tiendas Físicas"
        subtitle="Gestión de sucursales y puntos de venta."
        action={
          <Button icon={<Plus size={20} />} onClick={() => setIsCreateOpen(true)}>
            Nueva Tienda
          </Button>
        }
      />

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <SearchInput placeholder="Buscar tienda..." />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm">
                <th className="p-4 font-medium border-b border-gray-100">ID</th>
                <th className="p-4 font-medium border-b border-gray-100">Nombre</th>
                <th className="p-4 font-medium border-b border-gray-100">Dirección</th>
                <th className="p-4 font-medium border-b border-gray-100">Estado</th>
                <th className="p-4 font-medium border-b border-gray-100 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm">
              {stores.map((store) => (
                <tr key={store.id} className="hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-none">
                  <td className="p-4">#{store.id}</td>
                  <td className="p-4 font-medium text-gray-900">{store.name}</td>
                  <td className="p-4">{store.address}</td>
                  <td className="p-4">
                    <StatusBadge status={store.status} />
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
      <StoreForm isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} mode="create" />
      <StoreForm isOpen={isEditOpen}   onClose={() => setIsEditOpen(false)}   mode="edit" />
    </div>
  );
}
