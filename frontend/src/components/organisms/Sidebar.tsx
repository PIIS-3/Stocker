import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Store, Users, Tags, Box, LogOut } from 'lucide-react';
import { Logo } from '../atoms/Logo';
import { NavItem } from '../molecules/NavItem';
import { authService } from '../../services/auth.service';
import { Button } from '../atoms/Button';

const navItems = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Productos', path: '/admin/products', icon: Box },
  { name: 'Categorías', path: '/admin/categories', icon: Tags },
  { name: 'Tiendas Físicas', path: '/admin/stores', icon: Store },
  { name: 'Usuarios', path: '/admin/users', icon: Users },
];

/**
 * Componente: Sidebar
 * Barra lateral de navegación para el panel de administración.
 * Define las rutas principales y permite cerrar la sesión.
 */
export function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div className="w-64 bg-white border-r border-gray-100 flex flex-col h-full shadow-sm">
      <div className="h-20 flex items-center px-6 border-b border-gray-50">
        <Logo label="Stocker Admin" iconSize="h-8 w-8" />
      </div>

      <div className="flex-1 py-6 px-4 flex flex-col gap-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavItem key={item.path} {...item} />
        ))}
      </div>

      <div className="p-4 border-t border-gray-50">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl px-4 py-3"
          icon={<LogOut size={20} />}
        >
          <span className="font-medium">Cerrar sesión</span>
        </Button>
      </div>
    </div>
  );
}
