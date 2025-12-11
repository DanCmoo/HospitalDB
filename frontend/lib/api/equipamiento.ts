import { apiClient } from './client';
import { Equipamiento, CreateEquipamientoDto, UpdateEquipamientoDto } from '@/types/equipamiento';

export const equipamientoApi = {
  getAll: async (): Promise<Equipamiento[]> => {
    const response = await apiClient.get<Equipamiento[]>('/equipamiento');
    return response.data;
  },

  getByCodigo: async (codigo: number): Promise<Equipamiento> => {
    const response = await apiClient.get<Equipamiento>(`/equipamiento/${codigo}`);
    return response.data;
  },

  search: async (term: string): Promise<Equipamiento[]> => {
    const response = await apiClient.get<Equipamiento[]>('/equipamiento/search', {
      params: { term },
    });
    return response.data;
  },

  getByEstado: async (estado: string): Promise<Equipamiento[]> => {
    const response = await apiClient.get<Equipamiento[]>('/equipamiento', {
      params: { estado },
    });
    return response.data;
  },

  getByEmpleado: async (empleado: number): Promise<Equipamiento[]> => {
    const response = await apiClient.get<Equipamiento[]>('/equipamiento', {
      params: { empleado },
    });
    return response.data;
  },

  getByDepartamento: async (departamento: string): Promise<Equipamiento[]> => {
    const response = await apiClient.get<Equipamiento[]>('/equipamiento', {
      params: { departamento },
    });
    return response.data;
  },

  getWithPagination: async (page: number, limit: number) => {
    const response = await apiClient.get('/equipamiento', {
      params: { page, limit },
    });
    return response.data;
  },

  getCount: async (): Promise<number> => {
    const response = await apiClient.get<{ count: number }>('/equipamiento/count');
    return response.data.count;
  },

  getNextCodigo: async (): Promise<number> => {
    const response = await apiClient.get<{ nextCodigo: number }>('/equipamiento/next-codigo');
    return response.data.nextCodigo;
  },

  create: async (data: CreateEquipamientoDto): Promise<Equipamiento> => {
    const response = await apiClient.post<Equipamiento>('/equipamiento', data);
    return response.data;
  },

  update: async (codigo: number, data: UpdateEquipamientoDto): Promise<Equipamiento> => {
    const response = await apiClient.put<Equipamiento>(`/equipamiento/${codigo}`, data);
    return response.data;
  },

  delete: async (codigo: number): Promise<void> => {
    await apiClient.delete(`/equipamiento/${codigo}`);
  },
};
