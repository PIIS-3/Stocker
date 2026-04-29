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

  /** Verifica si hay una sesión activa */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }
};
