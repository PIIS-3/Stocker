import api from './api';

export interface RoleApi {
  id_role: number;
  role_name: string;
  status: string;
}

export interface StoreApiShort {
  id_store: number;
  store_name: string;
  status: string;
}

export interface EmployeeApi {
  id_employee: number;
  first_name: string;
  last_name: string;
  username: string;
  status: string;
  role_id: number;
  store_id: number;
  created_at?: string;
  updated_at?: string;
  role?: RoleApi;
  store?: StoreApiShort;
}

export interface EmployeeCreate {
  first_name: string;
  last_name: string;
  username: string;
  status: string;
  role_id: number;
  store_id: number;
  hashed_password?: string; // Nota: El backend espera hashed_password en el modelo EmployeeCreate
}

export interface EmployeeUpdate {
  first_name?: string;
  last_name?: string;
  username?: string;
  status?: string;
  role_id?: number;
  store_id?: number;
  hashed_password?: string;
}

const RESOURCE = '/employees';

export const employeesService = {
  /** Obtiene listado de empleados con paginación opcional */
  async getEmployees(skip = 0, limit = 100): Promise<EmployeeApi[]> {
    const { data } = await api.get<EmployeeApi[]>(RESOURCE, {
      params: { skip, limit },
    });
    return data;
  },

  /** Obtiene el detalle de un empleado por ID */
  async getEmployeeById(employeeId: number): Promise<EmployeeApi> {
    const { data } = await api.get<EmployeeApi>(`${RESOURCE}/${employeeId}`);
    return data;
  },

  /** Crea un nuevo empleado */
  async createEmployee(employee: EmployeeCreate): Promise<EmployeeApi> {
    const { data } = await api.post<EmployeeApi>(RESOURCE, employee);
    return data;
  },

  /** Actualiza un empleado existente */
  async updateEmployee(employeeId: number, employee: EmployeeUpdate): Promise<EmployeeApi> {
    const { data } = await api.patch<EmployeeApi>(`${RESOURCE}/${employeeId}`, employee);
    return data;
  },

  /** Elimina un empleado */
  async deleteEmployee(employeeId: number): Promise<EmployeeApi> {
    const { data } = await api.delete<EmployeeApi>(`${RESOURCE}/${employeeId}`);
    return data;
  },
};
