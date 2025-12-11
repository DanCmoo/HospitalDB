import { apiClient } from './client';
import { Paciente, CreatePacienteDto, UpdatePacienteDto } from '@/types/paciente';

export const pacientesApi = {
  getAll: async (): Promise<Paciente[]> => {
    return apiClient.get<Paciente[]>('/pacientes');
  },

  getByCodigo: async (codigo: number): Promise<Paciente> => {
    return apiClient.get<Paciente>(`/pacientes/${codigo}`);
  },

  search: async (term: string): Promise<Paciente[]> => {
    return apiClient.get<Paciente[]>(`/pacientes/search?term=${encodeURIComponent(term)}`);
  },

  getByGenero: async (genero: string): Promise<Paciente[]> => {
    return apiClient.get<Paciente[]>(`/pacientes?genero=${encodeURIComponent(genero)}`);
  },

  getWithPagination: async (page: number, limit: number) => {
    return apiClient.get(`/pacientes?page=${page}&limit=${limit}`);
  },

  getCount: async (): Promise<number> => {
    const result = await apiClient.get<{ count: number }>('/pacientes/count');
    return result.count;
  },

  getNextCodigo: async (): Promise<number> => {
    const result = await apiClient.get<{ nextCodigo: number }>('/pacientes/next-codigo');
    return result.nextCodigo;
  },

  create: async (data: CreatePacienteDto): Promise<Paciente> => {
    return apiClient.post<Paciente>('/pacientes', data);
  },

  update: async (codigo: number, data: UpdatePacienteDto): Promise<Paciente> => {
    return apiClient.put<Paciente>(`/pacientes/${codigo}`, data);
  },

  delete: async (codigo: number): Promise<void> => {
    await apiClient.delete(`/pacientes/${codigo}`);
  },
};
