import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { storesService, type StoreCreate, type StoreUpdate } from '../services/stores.service';

export const storeKeys = {
  all: ['stores'] as const,
  list: (params?: { skip?: number; limit?: number }) => [...storeKeys.all, 'list', params] as const,
  detail: (id: number) => [...storeKeys.all, 'detail', id] as const,
};

export function storesListOptions(skip = 0, limit = 1000) {
  return queryOptions({
    queryKey: storeKeys.list({ skip, limit }),
    queryFn: () => storesService.getStores(skip, limit),
  });
}

export function useCreateStore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: StoreCreate) => storesService.createStore(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: storeKeys.all }),
  });
}

export function useUpdateStore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: StoreUpdate }) =>
      storesService.updateStore(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: storeKeys.all }),
  });
}

export function useDeleteStore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => storesService.deleteStore(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: storeKeys.all }),
  });
}
