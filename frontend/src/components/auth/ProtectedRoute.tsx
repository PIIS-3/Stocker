import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  allowedRoles?: Array<'SuperAdmin' | 'Manager' | 'Staff'>;
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="p-6">Cargando sesión...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles?.length && user?.role_name && !allowedRoles.includes(user.role_name)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}