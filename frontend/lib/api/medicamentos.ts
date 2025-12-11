import { apiClient } from './client';
import { Medicamento, CreateMedicamentoDto, UpdateMedicamentoDto, UpdateStockDto } from '@/types/medicamento';

export const medicamentosApi = {
  getAll: async (): Promise<Medicamento[]> => {
    const response = await apiClient.get<Medicamento[]>('/medicamentos');
    return response.data;
  },

  getByCodigo: async (codigo: number): Promise<Medicamento> => {
    const response = await apiClient.get<Medicamento>(`/medicamentos/${codigo}`);
    return response.data;
  },

  search: async (term: string): Promise<Medicamento[]> => {
    const response = await apiClient.get<Medicamento[]>('/medicamentos/search', {
      params: { term },
    });
    return response.data;
  },

  getByProveedor: async (proveedor: string): Promise<Medicamento[]> => {
    const response = await apiClient.get<Medicamento[]>('/medicamentos', {
      params: { proveedor },
    });
    return response.data;
  },

  getStockBajo: async (minimo: number = 10): Promise<Medicamento[]> => {
    const response = await apiClient.get<Medicamento[]>('/medicamentos/stock-bajo', {
      params: { minimo },
    });
    return response.data;
  },

  getWithPagination: async (page: number, limit: number) => {
    const response = await apiClient.get('/medicamentos', {
      params: { page, limit },
    });
    return response.data;
  },

  getCount: async (): Promise<number> => {
    const response = await apiClient.get<{ count: number }>('/medicamentos/count');
    return response.data.count;
  },

  getNextCodigo: async (): Promise<number> => {
    const response = await apiClient.get<{ nextCodigo: number }>('/medicamentos/next-codigo');
    return response.data.nextCodigo;
  },

  create: async (data: CreateMedicamentoDto): Promise<Medicamento> => {
    const response = await apiClient.post<Medicamento>('/medicamentos', data);
    return response.data;
  },

  update: async (codigo: number, data: UpdateMedicamentoDto): Promise<Medicamento> => {
    const response = await apiClient.put<Medicamento>(`/medicamentos/${codigo}`, data);
    return response.data;
  },

  updateStock: async (codigo: number, data: UpdateStockDto): Promise<Medicamento> => {
    const response = await apiClient.patch<Medicamento>(`/medicamentos/${codigo}/stock`, data);
    return response.data;
  },

  delete: async (codigo: number): Promise<void> => {
    await apiClient.delete(`/medicamentos/${codigo}`);
  },
};
