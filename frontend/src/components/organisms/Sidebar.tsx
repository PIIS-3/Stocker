import { Link } from 'react-router-dom';
import { LayoutDashboard, Store, Users, Tags, Box, LogOut } from 'lucide-react';
import { Logo } from '../atoms';
import { NavItem } from '../molecules';

const navItems = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Productos', path: '/admin/products', icon: Box },
  { name: 'Categorías', path: '/admin/categories', icon: Tags },
  { name: 'Tiendas', path: '/admin/stores', icon: Store },
  { name: 'Usuarios', path: '/admin/users', icon: Users },
];

export function Sidebar() {
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
        <Link to="/login" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all">
          <LogOut size={20} />
          <span className="font-medium">Cerrar sesión</span>
        </Link>
      </div>
    </div>
  );
}
