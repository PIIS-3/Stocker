import { Navigate, Outlet } from 'react-router-dom';
import { authService } from '../../services/auth.service';

interface RoleProtectedRouteProps {
  allowedRoles: string[];
  redirectTo?: string;
}

/**
 * Componente RoleProtectedRoute
 * Protege rutas basándose en el rol del usuario autenticado.
 * Si el rol no está permitido, redirige al dashboard o login.
 */
export function RoleProtectedRoute({
  allowedRoles,
  redirectTo = '/admin/dashboard',
}: RoleProtectedRouteProps) {
  const user = authService.getUser();

  // Si no hay usuario (sesión expirada), al login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si el rol no está en la lista permitida, redirige
  if (!allowedRoles.includes(user.role || '')) {
    return <Navigate to={redirectTo} replace />;
  }

  // Si tiene permiso, renderiza las rutas hijas
  return <Outlet />;
}
