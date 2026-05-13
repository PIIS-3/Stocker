import api from './api';

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export const authService = {
  /** Inicia sesión y guarda el token en localStorage */
  async login(username: string, password: string): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>('/auth/login', {
      username,
      password,
    });

    if (data.access_token) {
      localStorage.setItem('token', data.access_token);
    }

    return data;
  },

  /** Cierra sesión eliminando el token */
  logout(): void {
    localStorage.removeItem('token');
  },

  /** Verifica si hay una sesión activa y el token es válido */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;
    return !this.isTokenExpired(token);
  },

  /** Verifica si el token JWT ha expirado */
  isTokenExpired(token: string): boolean {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(this.decodeBase64(payload));
      if (!decoded.exp) return false;

      const now = Math.floor(Date.now() / 1000);
      return decoded.exp < now;
    } catch {
      return true;
    }
  },

  /** Decodifica base64 manejando caracteres especiales y padding */
  decodeBase64(str: string): string {
    try {
      // Reemplazar caracteres de base64url a base64 estándar
      const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
      // Añadir padding si falta
      const pad = base64.length % 4;
      const paddedBase64 = pad ? base64 + '='.repeat(4 - pad) : base64;

      return decodeURIComponent(
        atob(paddedBase64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
    } catch {
      return atob(str); // Fallback al atob estándar
    }
  },

  /** Obtiene datos del usuario decodificados del token */
  getUser(): { username: string; role?: string } | null {
    const token = localStorage.getItem('token');
    if (!token || this.isTokenExpired(token)) return null;
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(this.decodeBase64(payload));

      // Intentar obtener el nombre de usuario de 'sub' (estándar JWT) o 'username'
      const username = decoded.sub || decoded.username || decoded.name || 'Usuario';

      return {
        username,
        role: decoded.role || 'Admin',
      };
    } catch {
      return null;
    }
  },

  /**
   * Verifica si el usuario tiene permiso para realizar una acción en un módulo.
   * Centraliza las reglas de negocio de RBAC (Role-Based Access Control).
   */
  can(
    action: 'create' | 'edit' | 'delete' | 'view',
    module: 'products' | 'categories' | 'stores' | 'users' | 'dashboard' | 'settings'
  ): boolean {
    const user = this.getUser();
    if (!user) return false;
    const role = user.role;

    // SuperAdmin tiene acceso total a todo
    if (role === 'SuperAdmin') return true;

    // Manager: Acceso casi total excepto gestión de tiendas y eliminación de usuarios
    if (role === 'Manager') {
      if (module === 'stores' && (action === 'create' || action === 'edit' || action === 'delete')) {
        return false;
      }
      if (module === 'users' && action === 'delete') {
        return false;
      }
      return true;
    }

    // Staff: Solo productos, categorías, dashboard y ajustes. No puede borrar.
    if (role === 'Staff') {
      if (module === 'products' || module === 'categories') {
        return action !== 'delete';
      }
      if (module === 'dashboard' || module === 'settings') {
        return action === 'view';
      }
      return false;
    }

    return false;
  },
};
