import { apiClient } from './client';
import { Pertenece, CreatePerteneceDto } from '../types/pertenece';

export const perteneceApi = {
  getAll: async (params?: {
    nomDept?: string;
    codEq?: number;
  }): Promise<Pertenece[]> => {
    const queryParams = new URLSearchParams();
    if (params?.nomDept) queryParams.append('nomDept', params.nomDept);
    if (params?.codEq) queryParams.append('codEq', params.codEq.toString());

    const url = queryParams.toString() 
      ? `/pertenece?${queryParams.toString()}` 
      : '/pertenece';
    
    return await apiClient.get<Pertenece[]>(url);
  },

  getById: async (nomDept: string, codEq: number): Promise<Pertenece> => {
    return await apiClient.get<Pertenece>(`/pertenece/${nomDept}/${codEq}`);
  },

  getEquipamientoCount: async (nomDept: string): Promise<number> => {
    const response = await apiClient.get<{ count: number }>(`/pertenece/departamento/${nomDept}/count`);
    return response.count;
  },

  getDepartamentosCount: async (codEq: number): Promise<number> => {
    const response = await apiClient.get<{ count: number }>(`/pertenece/equipamiento/${codEq}/count`);
    return response.count;
  },

  create: async (data: CreatePerteneceDto): Promise<Pertenece> => {
    return await apiClient.post<Pertenece>('/pertenece', data);
  },

  delete: async (nomDept: string, codEq: number): Promise<void> => {
    await apiClient.delete(`/pertenece/${nomDept}/${codEq}`);
  },
};
