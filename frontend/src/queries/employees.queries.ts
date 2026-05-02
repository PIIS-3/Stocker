import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  employeesService,
  type EmployeeCreate,
  type EmployeeUpdate,
} from '../services/employees.service';
import { rolesService } from '../services/roles.service';

export const employeeKeys = {
  all: ['employees'] as const,
  list: (params?: { skip?: number; limit?: number }) =>
    [...employeeKeys.all, 'list', params] as const,
  detail: (id: number) => [...employeeKeys.all, 'detail', id] as const,
  roles: ['roles'] as const,
};

export function employeesListOptions(skip = 0, limit = 1000) {
  return queryOptions({
    queryKey: employeeKeys.list({ skip, limit }),
    queryFn: () => employeesService.getEmployees(skip, limit),
  });
}

export function rolesListOptions() {
  return queryOptions({
    queryKey: employeeKeys.roles,
    queryFn: () => rolesService.getRoles(),
  });
}

export function useCreateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: EmployeeCreate) => employeesService.createEmployee(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: employeeKeys.all }),
  });
}

export function useUpdateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: EmployeeUpdate }) =>
      employeesService.updateEmployee(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: employeeKeys.all }),
  });
}

export function useDeleteEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => employeesService.deleteEmployee(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: employeeKeys.all }),
  });
}
