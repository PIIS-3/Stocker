import api from './api';

export interface ProductCategory {
  id_category: number;
  category_name: string;
}

// Respuesta real del backend para /api/products
export interface ProductApi {
  id_product: number;
  sku: string;
  product_name: string;
  brand: string | null;
  fixed_selling_price: number;
  status: string;
  category_id: number;
  category: ProductCategory | null;
  created_at?: string;
  updated_at?: string;
}

export interface ProductCreate {
  sku: string;
  product_name: string;
  brand: string | null;
  fixed_selling_price: number;
  status: string;
  category_id: number;
}

export interface ProductUpdate {
  sku?: string;
  product_name?: string;
  brand?: string | null;
  fixed_selling_price?: number;
  status?: string;
  category_id?: number;
}

const RESOURCE = '/products';

export const productsService = {
  /** Obtiene listado de productos con paginación opcional */
  async getProducts(skip = 0, limit = 100): Promise<ProductApi[]> {
    const { data } = await api.get<ProductApi[]>(RESOURCE, {
      params: { skip, limit },
    });
    return data;
  },

  /** Obtiene el detalle de un producto por ID */
  async getProductById(productId: number): Promise<ProductApi> {
    const { data } = await api.get<ProductApi>(`${RESOURCE}/${productId}`);
    return data;
  },

  /** Crea un nuevo producto */
  async createProduct(product: ProductCreate): Promise<ProductApi> {
    const { data } = await api.post<ProductApi>(RESOURCE, product);
    return data;
  },

  /** Actualiza un producto existente */
  async updateProduct(productId: number, product: ProductUpdate): Promise<ProductApi> {
    const { data } = await api.patch<ProductApi>(`${RESOURCE}/${productId}`, product);
    return data;
  },

  /** Elimina un producto */
  async deleteProduct(productId: number): Promise<ProductApi> {
    const { data } = await api.delete<ProductApi>(`${RESOURCE}/${productId}`);
    return data;
  },
};
