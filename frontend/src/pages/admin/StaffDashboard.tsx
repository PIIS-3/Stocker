import { Package, Tags, Box, ExternalLink } from 'lucide-react';
import { PageHeader } from '../../components/molecules/PageHeader';
import { StatCard } from '../../components/molecules/StatCard';
import { Link } from 'react-router-dom';
import { authService } from '../../services/auth.service';

/**
 * Componente: StaffDashboard
 * Vista específica para usuarios de tipo Staff.
 * Enfocado en la gestión operativa de productos y categorías.
 */
export default function StaffDashboard() {
  const stats = [
    {
      label: 'Productos',
      value: '156',
      icon: Box,
      color: 'bg-indigo-50 text-indigo-600',
      border: 'border-indigo-100',
    },
    {
      label: 'Categorías',
      value: '24',
      icon: Tags,
      color: 'bg-emerald-50 text-emerald-600',
      border: 'border-emerald-100',
    },
  ];

  const user = authService.getUser();

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {user?.store_name && (
        <div className="mb-4 flex items-center gap-2 text-brand font-bold bg-brand/5 w-fit px-4 py-2 rounded-full border border-brand/10">
          <Box size={18} />
          <span>Tienda: {user.store_name}</span>
        </div>
      )}
      <PageHeader
        title="Panel de Operaciones"
        subtitle="Gestión directa de inventario y clasificación de productos."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Acceso Rápido */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Package className="text-brand" size={22} />
            Acciones Rápidas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/admin/products"
              className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl hover:bg-brand/5 hover:border-brand/20 border border-transparent transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-xl shadow-sm">
                  <Box className="text-brand" size={20} />
                </div>
                <div>
                  <p className="font-bold text-gray-800">Gestionar Productos</p>
                  <p className="text-xs text-gray-500">Actualizar stock y detalles</p>
                </div>
              </div>
              <ExternalLink size={18} className="text-gray-300 group-hover:text-brand" />
            </Link>

            <Link
              to="/admin/categories"
              className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl hover:bg-brand/5 hover:border-brand/20 border border-transparent transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-xl shadow-sm">
                  <Tags className="text-brand" size={20} />
                </div>
                <div>
                  <p className="font-bold text-gray-800">Clasificar Categorías</p>
                  <p className="text-xs text-gray-500">Organizar el catálogo</p>
                </div>
              </div>
              <ExternalLink size={18} className="text-gray-300 group-hover:text-brand" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
