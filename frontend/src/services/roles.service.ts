import api from './api';

export interface RoleApi {
  id_role: number;
  role_name: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

const RESOURCE = '/employees/roles';

export const rolesService = {
  /** Obtiene todos los roles disponibles */
  async getRoles(): Promise<RoleApi[]> {
    const { data } = await api.get<RoleApi[]>(RESOURCE);
    return data;
  },
};
