import { apiClient } from './client';

export interface ReportePacienteParams {
  codPac: number;
  fechaInicio?: string;
  fechaFin?: string;
}

export interface ReporteSedeParams {
  idSede: number;
  fechaInicio?: string;
  fechaFin?: string;
}

export interface ReporteGeneralParams {
  fechaInicio?: string;
  fechaFin?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const reportesApi = {
  /**
   * Genera reporte PDF de un paciente
   */
  generarReportePaciente: async (params: ReportePacienteParams): Promise<Blob> => {
    const queryParams = new URLSearchParams({
      codPac: params.codPac.toString(),
      ...(params.fechaInicio && { fechaInicio: params.fechaInicio }),
      ...(params.fechaFin && { fechaFin: params.fechaFin }),
    });

    const response = await fetch(`${API_URL}/reportes/paciente?${queryParams.toString()}`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Error al generar reporte');
    }

    return response.blob();
  },

  /**
   * Genera reporte PDF general del hospital
   */
  generarReporteGeneral: async (params?: ReporteGeneralParams): Promise<Blob> => {
    const queryParams = new URLSearchParams({
      ...(params?.fechaInicio && { fechaInicio: params.fechaInicio }),
      ...(params?.fechaFin && { fechaFin: params.fechaFin }),
    });

    const queryString = queryParams.toString();
    const url = queryString ? `/reportes/general?${queryString}` : '/reportes/general';
    
    const response = await fetch(`${API_URL}${url}`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error al generar reporte:', response.status, errorText);
      throw new Error(`Error al generar reporte: ${response.status} - ${errorText}`);
    }

    return response.blob();
  },

  /**
   * Genera reporte PDF de una sede
   */
  generarReporteSede: async (params: ReporteSedeParams): Promise<Blob> => {
    const queryParams = new URLSearchParams({
      idSede: params.idSede.toString(),
      ...(params.fechaInicio && { fechaInicio: params.fechaInicio }),
      ...(params.fechaFin && { fechaFin: params.fechaFin }),
    });

    const response = await fetch(`${API_URL}/reportes/sede?${queryParams.toString()}`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Error al generar reporte');
    }

    return response.blob();
  },

  /**
   * Helper para descargar un blob como archivo
   */
  descargarPDF: (blob: Blob, nombreArchivo: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombreArchivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
