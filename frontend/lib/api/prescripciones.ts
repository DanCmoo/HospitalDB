import { apiClient } from './client';
import { Prescribe, CreatePrescribeDto, UpdatePrescribeDto } from '../types/prescribe';

export const prescripcionesApi = {
  getAll: async (params?: {
    idCita?: number;
    codMed?: number;
  }): Promise<Prescribe[]> => {
    const queryParams = new URLSearchParams();
    if (params?.idCita) queryParams.append('idCita', params.idCita.toString());
    if (params?.codMed) queryParams.append('codMed', params.codMed.toString());

    const url = queryParams.toString() 
      ? `/prescripciones?${queryParams.toString()}` 
      : '/prescripciones';
    
    const response = await apiClient.get<Prescribe[]>(url);
    return response.data;
  },

  getOne: async (codMed: number, idCita: number): Promise<Prescribe> => {
    const response = await apiClient.get<Prescribe>(`/prescripciones/${codMed}/${idCita}`);
    return response.data;
  },

  create: async (data: CreatePrescribeDto): Promise<Prescribe> => {
    const response = await apiClient.post<Prescribe>('/prescripciones', data);
    return response.data;
  },

  update: async (codMed: number, idCita: number, data: UpdatePrescribeDto): Promise<Prescribe> => {
    const response = await apiClient.put<Prescribe>(`/prescripciones/${codMed}/${idCita}`, data);
    return response.data;
  },

  delete: async (codMed: number, idCita: number): Promise<void> => {
    await apiClient.delete(`/prescripciones/${codMed}/${idCita}`);
  },

  getCount: async (): Promise<number> => {
    const response = await apiClient.get<{ total: number }>('/prescripciones/estadisticas/total');
    return response.data.total;
  },
};
