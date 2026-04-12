import { type ElementType } from 'react';

interface StatCardProps {
  label: string;
  value: string;
  icon: ElementType;
  /** Clases de color para el contenedor del icono, p.ej. "bg-blue-50 text-blue-600" */
  color: string;
  /** Clase de borde del card, p.ej. "border-blue-100" */
  border: string;
}

export function StatCard({ label, value, icon: Icon, color, border }: StatCardProps) {
  return (
    <div
      className={`bg-white rounded-2xl p-6 border ${border} border-opacity-50 shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-1 duration-200`}
    >
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={26} strokeWidth={2.5} />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <h3 className="text-3xl font-bold text-gray-900 mt-1">{value}</h3>
      </div>
    </div>
  );
}
