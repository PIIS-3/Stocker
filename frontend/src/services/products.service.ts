import api from './api';

// ── Interfaz del Producto ───────────────────────────────────────────
// Define la estructura de datos que el frontend espera recibir de la API.
export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category_id: number;
  store_id: number;
}

// Payload para crear un producto (sin 'id', lo genera el backend)
export type CreateProductPayload = Omit<Product, 'id'>;
// Payload para actualizar parcialmente un producto
export type UpdateProductPayload = Partial<CreateProductPayload>;

// Ruta del recurso en la API
const RESOURCE = '/products';

// ── Servicio CRUD de Productos ──────────────────────────────────────
// Funciones que encapsulan las peticiones HTTP para el recurso Productos.
// Otros servicios (tiendas, categorías, empleados) deben seguir este mismo patrón.
export const productsService = {
  /** Obtiene todos los productos */
  getAll: () =>
    api.get<Product[]>(RESOURCE),

  /** Obtiene un producto por su ID */
  getById: (id: number) =>
    api.get<Product>(`${RESOURCE}/${id}`),

  /** Crea un nuevo producto */
  create: (data: CreateProductPayload) =>
    api.post<Product>(RESOURCE, data),

  /** Actualiza parcialmente un producto existente */
  update: (id: number, data: UpdateProductPayload) =>
    api.patch<Product>(`${RESOURCE}/${id}`, data),

  /** Elimina un producto por su ID */
  delete: (id: number) =>
    api.delete(`${RESOURCE}/${id}`),
};
