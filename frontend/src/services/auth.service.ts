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
      const decoded = JSON.parse(atob(payload));
      if (!decoded.exp) return false; // Si no hay exp, asumimos válido (poco probable en JWT estándar)
      
      const now = Math.floor(Date.now() / 1000);
      return decoded.exp < now;
    } catch {
      return true; // Si el token es malformado, lo tratamos como expirado/inválido
    }
  },

  /** Obtiene datos del usuario decodificados del token */
  getUser(): { username: string; role?: string } | null {
    const token = localStorage.getItem('token');
    if (!token || this.isTokenExpired(token)) return null;
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return {
        username: decoded.sub || 'Usuario',
        role: decoded.role || 'Admin',
      };
    } catch {
      return null;
    }
  },
};
