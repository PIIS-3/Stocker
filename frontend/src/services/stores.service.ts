import api from './api';

export interface StoreApi {
  id_store: number;
  store_name: string;
  address: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface StoreCreate {
  store_name: string;
  address: string;
  status: string;
}

export interface StoreUpdate {
  store_name?: string;
  address?: string;
  status?: string;
}

const RESOURCE = '/stores';

export const storesService = {
  /** Obtiene listado de tiendas con paginación opcional */
  async getStores(skip = 0, limit = 100): Promise<StoreApi[]> {
    const { data } = await api.get<StoreApi[]>(RESOURCE, {
      params: { skip, limit },
    });
    return data;
  },

  /** Obtiene el detalle de una tienda por ID */
  async getStoreById(storeId: number): Promise<StoreApi> {
    const { data } = await api.get<StoreApi>(`${RESOURCE}/${storeId}`);
    return data;
  },

  /** Crea una nueva tienda */
  async createStore(store: StoreCreate): Promise<StoreApi> {
    const { data } = await api.post<StoreApi>(RESOURCE, store);
    return data;
  },

  /** Actualiza una tienda existente */
  async updateStore(storeId: number, store: StoreUpdate): Promise<StoreApi> {
    const { data } = await api.patch<StoreApi>(`${RESOURCE}/${storeId}`, store);
    return data;
  },

  /** Elimina una tienda */
  async deleteStore(storeId: number): Promise<StoreApi> {
    const { data } = await api.delete<StoreApi>(`${RESOURCE}/${storeId}`);
    return data;
  },
};
