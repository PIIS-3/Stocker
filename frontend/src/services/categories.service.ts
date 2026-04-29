import api from './api';

export interface CategoryApi {
  id_category: number;
  category_name: string;
  description: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface CategoryCreate {
  category_name: string;
  description: string;
  status: string;
}

export interface CategoryUpdate {
  category_name?: string;
  description?: string;
  status?: string;
}

const RESOURCE = '/categories';

export const categoriesService = {
  /** Obtiene listado de categorías con paginación opcional */
  async getCategories(skip = 0, limit = 100): Promise<CategoryApi[]> {
    const { data } = await api.get<CategoryApi[]>(RESOURCE, {
      params: { skip, limit },
    });
    return data;
  },

  /** Obtiene el detalle de una categoría por ID */
  async getCategoryById(categoryId: number): Promise<CategoryApi> {
    const { data } = await api.get<CategoryApi>(`${RESOURCE}/${categoryId}`);
    return data;
  },

  /** Crea una nueva categoría */
  async createCategory(category: CategoryCreate): Promise<CategoryApi> {
    const { data } = await api.post<CategoryApi>(RESOURCE, category);
    return data;
  },

  /** Actualiza una categoría existente */
  async updateCategory(categoryId: number, category: CategoryUpdate): Promise<CategoryApi> {
    const { data } = await api.patch<CategoryApi>(`${RESOURCE}/${categoryId}`, category);
    return data;
  },

  /** Elimina una categoría */
  async deleteCategory(categoryId: number): Promise<CategoryApi> {
    const { data } = await api.delete<CategoryApi>(`${RESOURCE}/${categoryId}`);
    return data;
  },
};
