import { apiClient } from './client';
import { HistorialMedico, CreateHistorialMedicoDto, UpdateHistorialMedicoDto } from '../types/historial-medico';

export const historialesApi = {
  getAll: async (params?: {
    codPac?: number;
    idEmp?: number;
    fecha?: string;
    fechaInicio?: string;
    fechaFin?: string;
    idSede?: number;
  }): Promise<HistorialMedico[]> => {
    const queryParams = new URLSearchParams();
    if (params?.codPac) queryParams.append('codPac', params.codPac.toString());
    if (params?.idEmp) queryParams.append('idEmp', params.idEmp.toString());
    if (params?.fecha) queryParams.append('fecha', params.fecha);
    if (params?.fechaInicio) queryParams.append('fechaInicio', params.fechaInicio);
    if (params?.fechaFin) queryParams.append('fechaFin', params.fechaFin);
    if (params?.idSede) queryParams.append('idSede', params.idSede.toString());

    const url = queryParams.toString() 
      ? `/historiales?${queryParams.toString()}` 
      : '/historiales';
    
    const response = await apiClient.get<HistorialMedico[]>(url);
    return response.data;
  },

  getById: async (id: number): Promise<HistorialMedico> => {
    const response = await apiClient.get<HistorialMedico>(`/historiales/${id}`);
    return response.data;
  },

  create: async (data: CreateHistorialMedicoDto): Promise<HistorialMedico> => {
    const response = await apiClient.post<HistorialMedico>('/historiales', data);
    return response.data;
  },

  update: async (id: number, data: UpdateHistorialMedicoDto): Promise<HistorialMedico> => {
    const response = await apiClient.put<HistorialMedico>(`/historiales/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/historiales/${id}`);
  },

  getCount: async (): Promise<number> => {
    const response = await apiClient.get<{ total: number }>('/historiales/estadisticas/total');
    return response.data.total;
  },
};
