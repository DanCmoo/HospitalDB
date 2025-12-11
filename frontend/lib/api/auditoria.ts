import { apiClient } from './client';
import { Auditoria, CreateAuditoriaDto } from '../types/auditoria';

export const auditoriaApi = {
  getAll: async (params?: {
    numDoc?: string;
    accion?: string;
    tablaAfectada?: string;
    fecha?: string;
    fechaInicio?: string;
    fechaFin?: string;
  }): Promise<Auditoria[]> => {
    const queryParams = new URLSearchParams();
    if (params?.numDoc) queryParams.append('numDoc', params.numDoc);
    if (params?.accion) queryParams.append('accion', params.accion);
    if (params?.tablaAfectada) queryParams.append('tablaAfectada', params.tablaAfectada);
    if (params?.fecha) queryParams.append('fecha', params.fecha);
    if (params?.fechaInicio) queryParams.append('fechaInicio', params.fechaInicio);
    if (params?.fechaFin) queryParams.append('fechaFin', params.fechaFin);

    const url = queryParams.toString() 
      ? `/auditoria?${queryParams.toString()}` 
      : '/auditoria';
    
    const response = await apiClient.get<Auditoria[]>(url);
    return response.data;
  },

  getById: async (id: number): Promise<Auditoria> => {
    const response = await apiClient.get<Auditoria>(`/auditoria/${id}`);
    return response.data;
  },

  create: async (data: CreateAuditoriaDto): Promise<Auditoria> => {
    const response = await apiClient.post<Auditoria>('/auditoria', data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/auditoria/${id}`);
  },

  getCount: async (): Promise<number> => {
    const response = await apiClient.get<{ total: number }>('/auditoria/estadisticas/total');
    return response.data.total;
  },
};
