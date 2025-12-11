import { apiClient } from './client';
import { AgendaCita, CreateAgendaCitaDto, UpdateAgendaCitaDto } from '../types/agenda-cita';

export const agendaCitasApi = {
  getAll: async (params?: {
    estado?: string;
    idEmp?: number;
    codPac?: number;
    fecha?: string;
    fechaInicio?: string;
    fechaFin?: string;
    idSede?: number;
  }): Promise<AgendaCita[]> => {
    const queryParams = new URLSearchParams();
    if (params?.estado) queryParams.append('estado', params.estado);
    if (params?.idEmp) queryParams.append('idEmp', params.idEmp.toString());
    if (params?.codPac) queryParams.append('codPac', params.codPac.toString());
    if (params?.fecha) queryParams.append('fecha', params.fecha);
    if (params?.fechaInicio) queryParams.append('fechaInicio', params.fechaInicio);
    if (params?.fechaFin) queryParams.append('fechaFin', params.fechaFin);
    if (params?.idSede) queryParams.append('idSede', params.idSede.toString());

    const url = queryParams.toString() 
      ? `/agenda-citas?${queryParams.toString()}` 
      : '/agenda-citas';
    
    const response = await apiClient.get<AgendaCita[]>(url);
    return response.data;
  },

  getById: async (id: number): Promise<AgendaCita> => {
    const response = await apiClient.get<AgendaCita>(`/agenda-citas/${id}`);
    return response.data;
  },

  create: async (data: CreateAgendaCitaDto): Promise<AgendaCita> => {
    const response = await apiClient.post<AgendaCita>('/agenda-citas', data);
    return response.data;
  },

  update: async (id: number, data: UpdateAgendaCitaDto): Promise<AgendaCita> => {
    const response = await apiClient.put<AgendaCita>(`/agenda-citas/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/agenda-citas/${id}`);
  },

  getCount: async (): Promise<number> => {
    const response = await apiClient.get<{ total: number }>('/agenda-citas/estadisticas/total');
    return response.data.total;
  },
};
