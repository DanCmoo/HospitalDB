import { apiClient } from './client';
import { Departamento, CreateDepartamentoRequest, UpdateDepartamentoRequest } from '@/types/departamento';
import { PaginationResponse } from '@/types/pagination';

export const departamentosApi = {
  getAll: () => apiClient.get<Departamento[]>('/departamentos'),
  
  getAllPaginated: (page: number, limit: number) =>
    apiClient.get<PaginationResponse<Departamento>>(`/departamentos?page=${page}&limit=${limit}`),
  
  getByNombre: (nombre: string) =>
    apiClient.get<Departamento>(`/departamentos/${encodeURIComponent(nombre)}`),
  
  getBySede: (idSede: number) =>
    apiClient.get<Departamento[]>(`/departamentos?idSede=${idSede}`),
  
  search: (term: string) =>
    apiClient.get<Departamento[]>(`/departamentos/search?term=${encodeURIComponent(term)}`),
  
  count: (idSede?: number) =>
    apiClient.get<{ count: number }>(`/departamentos/count${idSede ? `?idSede=${idSede}` : ''}`),
  
  create: (data: CreateDepartamentoRequest) =>
    apiClient.post<Departamento>('/departamentos', data),
  
  update: (nombre: string, data: UpdateDepartamentoRequest) =>
    apiClient.put<Departamento>(`/departamentos/${encodeURIComponent(nombre)}`, data),
  
  delete: (nombre: string) =>
    apiClient.delete(`/departamentos/${encodeURIComponent(nombre)}`),
};
