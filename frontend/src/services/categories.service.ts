import api from './api';

/**
 * Interfaz para el objeto Categoría devuelto por la API.
 */
export interface CategoryApi {
  id_category: number;
  category_name: string;
  description: string | null;
  status: 'Active' | 'Inactive';
  created_at: string;
  updated_at: string;
}

/**
 * Interfaz para crear una nueva categoría.
 */
export interface CategoryCreate {
  category_name: string;
  description: string;
  status: 'Active' | 'Inactive';
}

/**
 * Servicio para la gestión de categorías.
 */
export const categoriesService = {
  getCategories: async (skip: number = 0, limit: number = 100): Promise<CategoryApi[]> => {
    const response = await api.get<CategoryApi[]>(`/categories/?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  getCategory: async (id: number): Promise<CategoryApi> => {
    const response = await api.get<CategoryApi>(`/categories/${id}`);
    return response.data;
  },

  createCategory: async (data: CategoryCreate): Promise<CategoryApi> => {
    const response = await api.post<CategoryApi>('/categories/', data);
    return response.data;
  },

  updateCategory: async (id: number, data: Partial<CategoryCreate>): Promise<CategoryApi> => {
    const response = await api.put<CategoryApi>(`/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id: number): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },
};
