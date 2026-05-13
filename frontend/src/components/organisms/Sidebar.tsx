import { LayoutDashboard, Store, Users, Tags, Box } from 'lucide-react';
import { Logo } from '../atoms/Logo';
import { NavItem } from '../molecules/NavItem';
import { authService } from '../../services/auth.service';

const navItems = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard, module: 'dashboard' },
  { name: 'Productos', path: '/admin/products', icon: Box, module: 'products' },
  { name: 'Categorías', path: '/admin/categories', icon: Tags, module: 'categories' },
  { name: 'Tiendas Físicas', path: '/admin/stores', icon: Store, module: 'stores' },
  { name: 'Usuarios', path: '/admin/users', icon: Users, module: 'users' },
] as const;

export function Sidebar() {
  const filteredItems = navItems.filter((item) => authService.can('view', item.module));

  return (
    <div className="w-64 bg-white border-r border-gray-100 flex flex-col h-full shadow-sm">
      <div className="h-20 flex items-center px-6 border-b border-gray-50">
        <Logo label="Stocker Admin" iconSize="h-8 w-8" />
      </div>

      <div className="flex-1 py-6 px-4 flex flex-col gap-2 overflow-y-auto">
        {filteredItems.map((item) => (
          <NavItem key={item.path} {...item} />
        ))}
      </div>
    </div>
  );
}
