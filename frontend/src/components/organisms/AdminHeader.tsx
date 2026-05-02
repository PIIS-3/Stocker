import { authService } from '../../services/auth.service';

const roleColors: Record<string, string> = {
  SuperAdmin: 'text-purple-600',
  Manager: 'text-blue-600',
  Staff: 'text-emerald-600',
};

export function AdminHeader() {
  const user = authService.getUser();
  const username = user?.username || 'Administrador';
  const role = user?.role || 'DB_Admin';

  // Obtener iniciales (ej: "Juan Perez" -> "JP", "admin" -> "A")
  const initials = username
    .split(/[\s._]+/)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 shadow-sm z-10 w-full">
      <div className="flex-1" />

      <div className="flex items-center gap-4">
        <div className="text-right hidden md:block">
          <p className="text-sm font-semibold text-gray-800">{username}</p>
          <p
            className={`text-[10px] font-bold uppercase tracking-wider ${roleColors[role] || 'text-brand'}`}
          >
            {role}
          </p>
        </div>
        <div className="h-10 w-10 bg-brand/10 rounded-full flex items-center justify-center text-brand font-bold border border-brand/20 shadow-inner">
          {initials}
        </div>
      </div>
    </header>
  );
}
