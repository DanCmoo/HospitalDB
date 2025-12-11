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

    const response = await apiClient.get(`/reportes/paciente?${queryParams.toString()}`, {
      responseType: 'blob',
    });

    return response.data;
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
    
    const response = await apiClient.get(url, {
      responseType: 'blob',
    });

    return response.data;
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

    const response = await apiClient.get(`/reportes/sede?${queryParams.toString()}`, {
      responseType: 'blob',
    });

    return response.data;
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
