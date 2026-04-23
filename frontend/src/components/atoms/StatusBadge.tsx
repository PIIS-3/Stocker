interface StatusBadgeProps {
  /** Estado del recurso */
  status: string;
  /** Mapa de label activo/inactivo — permite variación de género (Activo/Activa) */
  activeLabel?: string;
  inactiveLabel?: string;
}

export function StatusBadge({
  status,
  activeLabel = 'Activo',
  inactiveLabel = 'Inactivo',
}: StatusBadgeProps) {
  const isActive = status === 'Active';

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${
        isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
      }`}
    >
      {isActive ? activeLabel : inactiveLabel}
    </span>
  );
}
