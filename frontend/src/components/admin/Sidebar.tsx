import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Store, Users, Tags, Box, LogOut } from 'lucide-react';
import logoUrl from '../../assets/logo_no_bg.png';

export function Sidebar() {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Productos', path: '/admin/products', icon: Box },
    { name: 'Categorías', path: '/admin/categories', icon: Tags },
    { name: 'Tiendas', path: '/admin/stores', icon: Store },
    { name: 'Usuarios', path: '/admin/users', icon: Users },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-100 flex flex-col h-full shadow-sm">
      <div className="h-20 flex items-center px-6 border-b border-gray-50">
        <Link to="/" className="flex items-center gap-3">
          <div className="h-8 w-8 flex items-center justify-center overflow-hidden mix-blend-multiply">
             <img src={logoUrl} alt="Stocker Logo" className="w-full h-full object-contain" />
          </div>
          <span className="text-xl font-bold text-gray-800">Stocker Admin</span>
        </Link>
      </div>

      <div className="flex-1 py-6 px-4 flex flex-col gap-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive 
                  ? 'bg-brand/10 text-brand font-semibold' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-brand' : 'text-gray-400'} />
              {item.name}
            </Link>
          );
        })}
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
