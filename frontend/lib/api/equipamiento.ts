import { apiClient } from './client';
import { Equipamiento, CreateEquipamientoDto, UpdateEquipamientoDto } from '@/types/equipamiento';

export const equipamientoApi = {
  getAll: async (): Promise<Equipamiento[]> => {
    return await apiClient.get<Equipamiento[]>('/equipamiento');
  },

  getByCodigo: async (codigo: number): Promise<Equipamiento> => {
    return await apiClient.get<Equipamiento>(`/equipamiento/${codigo}`);
  },

  search: async (term: string): Promise<Equipamiento[]> => {
    return await apiClient.get<Equipamiento[]>(`/equipamiento/search?term=${encodeURIComponent(term)}`);
  },

  getByEstado: async (estado: string): Promise<Equipamiento[]> => {
    return await apiClient.get<Equipamiento[]>(`/equipamiento?estado=${encodeURIComponent(estado)}`);
  },

  getByEmpleado: async (empleado: number): Promise<Equipamiento[]> => {
    return await apiClient.get<Equipamiento[]>(`/equipamiento?empleado=${empleado}`);
  },

  getByDepartamento: async (departamento: string): Promise<Equipamiento[]> => {
    return await apiClient.get<Equipamiento[]>(`/equipamiento?departamento=${encodeURIComponent(departamento)}`);
  },

  getWithPagination: async (page: number, limit: number) => {
    return await apiClient.get(`/equipamiento?page=${page}&limit=${limit}`);
  },

  getCount: async (): Promise<number> => {
    const response = await apiClient.get<{ count: number }>('/equipamiento/count');
    return response.count;
  },

  getNextCodigo: async (): Promise<number> => {
    const response = await apiClient.get<{ nextCodigo: number }>('/equipamiento/next-codigo');
    return response.nextCodigo;
  },

  create: async (data: CreateEquipamientoDto): Promise<Equipamiento> => {
    return await apiClient.post<Equipamiento>('/equipamiento', data);
  },

  update: async (codigo: number, data: UpdateEquipamientoDto): Promise<Equipamiento> => {
    return await apiClient.put<Equipamiento>(`/equipamiento/${codigo}`, data);
  },

  delete: async (codigo: number): Promise<void> => {
    await apiClient.delete(`/equipamiento/${codigo}`);
  },
};
