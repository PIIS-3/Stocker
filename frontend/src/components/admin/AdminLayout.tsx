import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function AdminLayout() {
  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900 overflow-hidden">
      {/* Barra lateral de navegación */}
      <Sidebar />

      {/* Área de contenido principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Barra superior */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-end px-8 shadow-sm z-10 w-full">
           <div className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="text-right hidden md:block">
                 <p className="text-sm font-semibold text-gray-800">Administrador Central</p>
                 <p className="text-xs text-brand">DB_Admin</p>
              </div>
              <div className="h-10 w-10 bg-brand/10 rounded-full flex items-center justify-center text-brand font-bold border border-brand/20 shadow-inner">
                 AC
              </div>
           </div>
        </header>

        {/* Zona de trabajo con scroll */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
