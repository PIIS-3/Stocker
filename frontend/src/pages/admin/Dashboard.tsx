import { Package, Store, Users, AlertCircle } from 'lucide-react';
import { PageHeader } from '../../components/molecules/PageHeader';
import { StatCard } from '../../components/molecules/StatCard';
import { authService } from '../../services/auth.service';
import StaffDashboard from './StaffDashboard';

/**
 * Componente: Dashboard
 * Vista general del panel de administración que muestra estadísticas rápidas
 * y permite gestionar preferencias del sistema como el sonido.
 */
export default function Dashboard() {
  const user = authService.getUser();
  const isManager = user?.role === 'Manager';

  if (user?.role === 'Staff') {
    return <StaffDashboard />;
  }

  // TODO: Implementar llamadas a API para obtener estadísticas reales del servidor.
  // Los valores actuales son marcadores de posición (placeholders) para la maqueta.
  const stats = [
    {
      label: 'Tiendas Activas',
      value: '12',
      icon: Store,
      color: 'bg-blue-50 text-blue-600',
      border: 'border-blue-100',
    },
    {
      label: 'Usuarios',
      value: '48',
      icon: Users,
      color: 'bg-indigo-50 text-indigo-600',
      border: 'border-indigo-100',
    },
    {
      label: 'Categorías',
      value: '34',
      icon: Package,
      color: 'bg-emerald-50 text-emerald-600',
      border: 'border-emerald-100',
    },
    {
      label: 'Alertas de Stock',
      value: '3',
      icon: AlertCircle,
      color: 'bg-rose-50 text-rose-600',
      border: 'border-rose-100',
    },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {isManager && user?.store_name && (
        <div className="mb-4 flex items-center gap-2 text-brand font-bold bg-brand/5 w-fit px-4 py-2 rounded-full border border-brand/10">
          <Store size={18} />
          <span>Tienda: {user.store_name}</span>
        </div>
      )}
      <PageHeader
        title="Vista General"
        subtitle="Bienvenido al panel de control central de Stocker."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 line-clamp-4">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Actividad Reciente</h2>
        <div className="flex flex-col gap-5">
          <div className="flex items-start gap-4">
            <div className="w-2 h-2 mt-2 rounded-full bg-rose-500"></div>
            <div>
              <p className="text-gray-800 text-sm">
                La tienda <span className="font-semibold">Madrid Centro</span> ha reportado un
                problema de stock en la categoría <span className="italic">Electrónica</span>.
              </p>
              <p className="text-xs text-gray-400 mt-1">Hace 2 horas</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-2 h-2 mt-2 rounded-full bg-indigo-500"></div>
            <div>
              <p className="text-gray-800 text-sm">
                Nuevo empleado <span className="font-semibold">Ana López</span> registrado en{' '}
                <span className="font-semibold">Barcelona Norte</span> por el Administrador.
              </p>
              <p className="text-xs text-gray-400 mt-1">Hace 5 horas</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-2 h-2 mt-2 rounded-full bg-emerald-500"></div>
            <div>
              <p className="text-gray-800 text-sm">
                Se creó la nueva categoría <span className="italic">Ropa Deportiva</span>.
              </p>
              <p className="text-xs text-gray-400 mt-1">Ayer a las 14:32</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
