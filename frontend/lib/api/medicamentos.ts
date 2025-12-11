import { apiClient } from './client';
import { Medicamento, CreateMedicamentoDto, UpdateMedicamentoDto, UpdateStockDto } from '@/types/medicamento';

export const medicamentosApi = {
  getAll: async (): Promise<Medicamento[]> => {
    return await apiClient.get<Medicamento[]>('/medicamentos');
  },

  getByCodigo: async (codigo: number): Promise<Medicamento> => {
    return await apiClient.get<Medicamento>(`/medicamentos/${codigo}`);
  },

  search: async (term: string): Promise<Medicamento[]> => {
    return await apiClient.get<Medicamento[]>(`/medicamentos/search?term=${encodeURIComponent(term)}`);
  },

  getByProveedor: async (proveedor: string): Promise<Medicamento[]> => {
    return await apiClient.get<Medicamento[]>(`/medicamentos?proveedor=${encodeURIComponent(proveedor)}`);
  },

  getStockBajo: async (minimo: number = 10): Promise<Medicamento[]> => {
    return await apiClient.get<Medicamento[]>(`/medicamentos/stock-bajo?minimo=${minimo}`);
  },

  getWithPagination: async (page: number, limit: number) => {
    return await apiClient.get(`/medicamentos?page=${page}&limit=${limit}`);
  },

  getCount: async (): Promise<number> => {
    const response = await apiClient.get<{ count: number }>('/medicamentos/count');
    return response.count;
  },

  getNextCodigo: async (): Promise<number> => {
    const response = await apiClient.get<{ nextCodigo: number }>('/medicamentos/next-codigo');
    return response.nextCodigo;
  },

  create: async (data: CreateMedicamentoDto): Promise<Medicamento> => {
    return await apiClient.post<Medicamento>('/medicamentos', data);
  },

  update: async (codigo: number, data: UpdateMedicamentoDto): Promise<Medicamento> => {
    return await apiClient.put<Medicamento>(`/medicamentos/${codigo}`, data);
  },

  updateStock: async (codigo: number, data: UpdateStockDto): Promise<Medicamento> => {
    return await apiClient.patch<Medicamento>(`/medicamentos/${codigo}/stock`, data);
  },

  delete: async (codigo: number): Promise<void> => {
    await apiClient.delete(`/medicamentos/${codigo}`);
  },
};
