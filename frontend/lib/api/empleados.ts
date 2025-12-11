import { apiClient } from './client';
import { Empleado, CreateEmpleadoRequest, UpdateEmpleadoRequest } from '@/types/empleado';
import { PaginationResponse } from '@/types/pagination';

export const empleadosApi = {
  getAll: () => apiClient.get<Empleado[]>('/empleados'),
  
  getAllPaginated: (page: number, limit: number) =>
    apiClient.get<PaginationResponse<Empleado>>(`/empleados?page=${page}&limit=${limit}`),
  
  getById: (id: number) =>
    apiClient.get<Empleado>(`/empleados/${id}`),
  
  getByCargo: (cargo: string) =>
    apiClient.get<Empleado[]>(`/empleados?cargo=${encodeURIComponent(cargo)}`),
  
  getByDepartamento: (departamento: string) =>
    apiClient.get<Empleado[]>(`/empleados?departamento=${encodeURIComponent(departamento)}`),
  
  count: () =>
    apiClient.get<{ count: number }>('/empleados/count'),
  
  create: (data: CreateEmpleadoRequest) =>
    apiClient.post<Empleado>('/empleados', data),
  
  update: (id: number, data: UpdateEmpleadoRequest) =>
    apiClient.put<Empleado>(`/empleados/${id}`, data),
  
  delete: (id: number) =>
    apiClient.delete(`/empleados/${id}`),
};
