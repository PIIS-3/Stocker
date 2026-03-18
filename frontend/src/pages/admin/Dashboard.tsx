import { Package, Store, Users, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const stats = [
    { label: 'Tiendas Activas', value: '12', icon: Store, color: 'bg-blue-50 text-blue-600', border: 'border-blue-100' },
    { label: 'Usuarios', value: '48', icon: Users, color: 'bg-indigo-50 text-indigo-600', border: 'border-indigo-100' },
    { label: 'Categorías', value: '34', icon: Package, color: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-100' },
    { label: 'Alertas de Stock', value: '3', icon: AlertCircle, color: 'bg-rose-50 text-rose-600', border: 'border-rose-100' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Vista General</h1>
        <p className="text-gray-500 mt-1">Bienvenido al panel de control central de Stocker.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className={`bg-white rounded-2xl p-6 border ${stat.border} border-opacity-50 shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-1 duration-200`}>
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${stat.color}`}>
                <Icon size={26} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 line-clamp-4">
         <h2 className="text-lg font-bold text-gray-900 mb-6">Actividad Reciente</h2>
         <div className="flex flex-col gap-5">
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 mt-2 rounded-full bg-rose-500"></div>
              <div>
                <p className="text-gray-800 text-sm">La tienda <span className="font-semibold">Madrid Centro</span> ha reportado un problema de stock en la categoría <span className="italic">Electrónica</span>.</p>
                <p className="text-xs text-gray-400 mt-1">Hace 2 horas</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 mt-2 rounded-full bg-indigo-500"></div>
              <div>
                <p className="text-gray-800 text-sm">Nuevo empleado <span className="font-semibold">Ana López</span> registrado en <span className="font-semibold">Barcelona Norte</span> por el Administrador.</p>
                <p className="text-xs text-gray-400 mt-1">Hace 5 horas</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 mt-2 rounded-full bg-emerald-500"></div>
              <div>
                <p className="text-gray-800 text-sm">Se creó la nueva categoría <span className="italic">Ropa Deportiva</span>.</p>
                <p className="text-xs text-gray-400 mt-1">Ayer a las 14:32</p>
              </div>
            </div>
         </div>
      </div>
    </div>
  );
}
