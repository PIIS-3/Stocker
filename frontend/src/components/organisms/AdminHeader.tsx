import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { Button } from '../atoms/Button';

export function AdminHeader() {
  const navigate = useNavigate();
  const user = authService.getUser();
  const username = user?.username || 'Administrador';
  const role = user?.role || 'DB_Admin';

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };
  
  // Obtener iniciales (ej: "Juan Perez" -> "JP", "admin" -> "A")
  const initials = username
    .split(/[\s._]+/)
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 shadow-sm z-10 w-full">
      <div className="flex-1" />
      
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold text-gray-800">{username}</p>
            <p className="text-xs text-brand">{role}</p>
          </div>
          <div className="h-10 w-10 bg-brand/10 rounded-full flex items-center justify-center text-brand font-bold border border-brand/20 shadow-inner">
            {initials}
          </div>
        </div>

        <div className="h-8 w-px bg-gray-100" />

        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleLogout}
          icon={<LogOut size={16} />}
          className="text-gray-500 hover:text-rose-600 hover:bg-rose-50"
        >
          <span className="hidden sm:inline">Cerrar Sesión</span>
        </Button>
      </div>
    </header>
  );
}
