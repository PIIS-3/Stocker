import { Outlet } from 'react-router-dom';
import { Sidebar } from '../organisms/Sidebar';
import { AdminHeader } from '../organisms/AdminHeader';

export function AdminLayout() {
  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900 overflow-hidden">
      {/* Barra lateral de navegación */}
      <Sidebar />

      {/* Área de contenido principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Barra superior */}
        <AdminHeader />

        {/* Zona de trabajo con scroll */}
        <main className="flex-1 min-h-0 overflow-x-hidden overflow-y-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
