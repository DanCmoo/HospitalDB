import { apiClient } from './client';
import { Sede, CreateSedeRequest, UpdateSedeRequest } from '@/types/sede';
import { PaginationResponse } from '@/types/pagination';

export const sedesApi = {
  getAll: () => apiClient.get<Sede[]>('/sedes'),
  
  getAllPaginated: (page: number, limit: number) =>
    apiClient.get<PaginationResponse<Sede>>(`/sedes?page=${page}&limit=${limit}`),
  
  getById: (id: number) =>
    apiClient.get<Sede>(`/sedes/${id}`),
  
  getByCiudad: (ciudad: string) =>
    apiClient.get<Sede[]>(`/sedes?ciudad=${encodeURIComponent(ciudad)}`),
  
  search: (term: string) =>
    apiClient.get<Sede[]>(`/sedes/search?term=${encodeURIComponent(term)}`),
  
  count: () =>
    apiClient.get<{ count: number }>('/sedes/count'),
  
  getNextId: () =>
    apiClient.get<{ nextId: number }>('/sedes/next-id'),
  
  create: (data: CreateSedeRequest) =>
    apiClient.post<Sede>('/sedes', data),
  
  update: (id: number, data: UpdateSedeRequest) =>
    apiClient.put<Sede>(`/sedes/${id}`, data),
  
  delete: (id: number) =>
    apiClient.delete(`/sedes/${id}`),
};
