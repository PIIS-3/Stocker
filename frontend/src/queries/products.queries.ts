import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsService, type ProductCreate, type ProductUpdate } from '../services/products.service';

export const productKeys = {
  all: ['products'] as const,
  list: (params?: { skip?: number; limit?: number }) =>
    [...productKeys.all, 'list', params] as const,
  detail: (id: number) => [...productKeys.all, 'detail', id] as const,
};

export function productsListOptions(skip = 0, limit = 1000) {
  return queryOptions({
    queryKey: productKeys.list({ skip, limit }),
    queryFn: () => productsService.getProducts(skip, limit),
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ProductCreate) => productsService.createProduct(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.all }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductUpdate }) =>
      productsService.updateProduct(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.all }),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => productsService.deleteProduct(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.all }),
  });
}
