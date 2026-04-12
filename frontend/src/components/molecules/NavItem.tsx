import { Link, useLocation } from 'react-router-dom';
import { type ElementType } from 'react';

interface NavItemProps {
  name: string;
  path: string;
  icon: ElementType;
}

export function NavItem({ name, path, icon: Icon }: NavItemProps) {
  const location = useLocation();
  const isActive = location.pathname.startsWith(path);

  return (
    <Link
      to={path}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        isActive
          ? 'bg-brand/10 text-brand font-semibold'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <Icon size={20} className={isActive ? 'text-brand' : 'text-gray-400'} />
      {name}
    </Link>
  );
}
