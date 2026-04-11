import api from './api';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface CurrentUser {
  id_employee: number;
  first_name: string;
  last_name: string;
  username: string;
  status: 'Active' | 'Inactive';
  role_id: number;
  store_id: number;
  role_name?: 'SuperAdmin' | 'Manager' | 'Staff';
}

const TOKEN_KEY = 'stocker_access_token';

export const AuthService = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', data);
    return response.data;
  },

  async me(): Promise<CurrentUser> {
    const response = await api.get<CurrentUser>('/auth/me');
    return response.data;
  },

  saveToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  clearToken() {
    localStorage.removeItem(TOKEN_KEY);
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem(TOKEN_KEY);
  },
};