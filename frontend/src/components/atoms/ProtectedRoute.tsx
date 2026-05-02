import { Navigate, Outlet } from 'react-router-dom';
import { authService } from '../../services/auth.service';

/**
 * Componente ProtectedRoute
 * Envuelve rutas que requieren autenticación.
 * Si el usuario no tiene token, lo redirige al login.
 */
export function ProtectedRoute() {
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    // Redirigir al login si no está autenticado
    return <Navigate to="/login" replace />;
  }

  // Si está autenticado, renderiza las rutas hijas
  return <Outlet />;
}
