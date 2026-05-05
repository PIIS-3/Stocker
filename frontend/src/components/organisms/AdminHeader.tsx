import { useState, useRef, useEffect } from 'react';
import { authService } from '../../services/auth.service';
import { Settings as SettingsIcon, LogOut, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const roleColors: Record<string, string> = {
  SuperAdmin: 'text-purple-600',
  Manager: 'text-blue-600',
  Staff: 'text-emerald-600',
};

export function AdminHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const user = authService.getUser();
  const username = user?.username || 'Administrador';
  const role = user?.role || 'DB_Admin';

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Obtener iniciales
  const initials = username
    .split(/[\s._]+/)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 shadow-sm z-30 w-full">
      <div className="flex-1" />

      <div className="flex items-center gap-4 relative" ref={dropdownRef}>
        {/* Información del usuario (clicable) */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 hover:bg-gray-50 p-1.5 pr-3 rounded-full transition-all group"
        >
          <div className="text-right hidden md:block mr-1">
            <p className="text-sm font-semibold text-gray-800 group-hover:text-brand transition-colors">{username}</p>
            <p className={`text-[10px] font-bold uppercase tracking-wider ${roleColors[role] || 'text-brand'}`}>
              {role}
            </p>
          </div>
          
          <div className="relative">
            <div className="h-10 w-10 bg-brand/10 rounded-full flex items-center justify-center text-brand font-bold border border-brand/20 shadow-inner group-hover:scale-105 transition-transform">
              {initials}
            </div>
            {/* Indicador de dropdown */}
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full border border-gray-100 shadow-sm p-0.5 text-gray-400 group-hover:text-brand group-hover:rotate-180 transition-all duration-300">
              <ChevronDown size={12} />
            </div>
          </div>
        </button>

        {/* Menú Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-gray-50 mb-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Cuenta</p>
              </div>

              <Link 
                to="/admin/settings"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-brand/5 hover:text-brand transition-colors mx-2 rounded-xl group"
              >
                <div className="p-1.5 bg-gray-50 group-hover:bg-brand/10 rounded-lg transition-colors">
                  <SettingsIcon size={18} />
                </div>
                <span className="font-medium">Ajustes</span>
              </Link>

              <button 
                className="w-[calc(100%-1rem)] flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors mx-2 rounded-xl group"
              >
                <div className="p-1.5 bg-gray-50 group-hover:bg-red-100 rounded-lg transition-colors">
                  <LogOut size={18} />
                </div>
                <span className="font-medium">Cerrar sesión</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
