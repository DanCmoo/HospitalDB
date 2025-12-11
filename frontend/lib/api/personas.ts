import { apiClient } from './client';
import { Persona, CreatePersonaRequest, UpdatePersonaRequest } from '@/types/persona';
import { PaginationResponse } from '@/types/pagination';

export const personasApi = {
  getAll: () => apiClient.get<Persona[]>('/personas'),
  
  getAllPaginated: (page: number, limit: number) =>
    apiClient.get<PaginationResponse<Persona>>(`/personas?page=${page}&limit=${limit}`),
  
  getByNumDoc: (numDoc: string) =>
    apiClient.get<Persona>(`/personas/${numDoc}`),
  
  search: (nombre: string) =>
    apiClient.get<Persona[]>(`/personas/search?nombre=${encodeURIComponent(nombre)}`),
  
  count: () =>
    apiClient.get<{ count: number }>('/personas/count'),
  
  create: (data: CreatePersonaRequest) =>
    apiClient.post<Persona>('/personas', data),
  
  update: (numDoc: string, data: UpdatePersonaRequest) =>
    apiClient.put<Persona>(`/personas/${numDoc}`, data),
  
  delete: (numDoc: string) =>
    apiClient.delete(`/personas/${numDoc}`),
};
