import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  categoriesService,
  type CategoryCreate,
  type CategoryUpdate,
} from '../services/categories.service';

export const categoryKeys = {
  all: ['categories'] as const,
  list: (params?: { skip?: number; limit?: number }) =>
    [...categoryKeys.all, 'list', params] as const,
  detail: (id: number) => [...categoryKeys.all, 'detail', id] as const,
};

export function categoriesListOptions(skip = 0, limit = 1000) {
  return queryOptions({
    queryKey: categoryKeys.list({ skip, limit }),
    queryFn: () => categoriesService.getCategories(skip, limit),
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CategoryCreate) => categoriesService.createCategory(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: categoryKeys.all }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CategoryUpdate }) =>
      categoriesService.updateCategory(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: categoryKeys.all }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => categoriesService.deleteCategory(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: categoryKeys.all }),
  });
}
