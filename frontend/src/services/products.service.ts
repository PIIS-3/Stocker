import api from './api';

export interface ProductCategory {
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
  category: ProductCategory | null;
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
};
