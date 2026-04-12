import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Button, StatusBadge } from '../../components/atoms';
import { PageHeader, SearchInput, ActionButtons } from '../../components/molecules';
import { CategoryForm } from '../../components/organisms/CategoryForm';

export default function CategoriesList() {
  const categories = [
    { id: 1, name: 'Electrónica', description: 'Dispositivos, cables y accesorios tech', status: 'Active' },
    { id: 2, name: 'Ropa Deportiva', description: 'Indumentaria para actividades físicas', status: 'Active' },
    { id: 3, name: 'Hogar', description: 'Muebles y decoración', status: 'Inactive' },
    { id: 4, name: 'Alimentación', description: 'Productos no perecederos', status: 'Active' },
  ];

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <PageHeader
        title="Categorías"
        subtitle="Clasificación para el catálogo de productos."
        action={
          <Button icon={<Plus size={20} />} onClick={() => setIsCreateOpen(true)}>
            Crear Categoría
          </Button>
        }
      />

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <SearchInput placeholder="Buscar categoría..." />
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
                    <StatusBadge status={category.status} activeLabel="Activa" inactiveLabel="Inactiva" />
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
      <CategoryForm isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} mode="create" />
      <CategoryForm isOpen={isEditOpen}   onClose={() => setIsEditOpen(false)}   mode="edit" />
    </div>
  );
}
