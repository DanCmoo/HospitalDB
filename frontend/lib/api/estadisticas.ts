import { apiClient } from './client';

export const estadisticasApi = {
  // Medicamentos más recetados por sede en el último mes
  async getMedicamentosMasRecetados(idSede?: number) {
    const url = idSede 
      ? `/reportes/estadisticas/medicamentos-mas-recetados?idSede=${idSede}`
      : '/reportes/estadisticas/medicamentos-mas-recetados';
    return await apiClient.get(url);
  },

  // Médicos con mayor número de consultas atendidas por semana
  async getMedicosConMasConsultas(idSede?: number) {
    const url = idSede 
      ? `/reportes/estadisticas/medicos-mas-consultas?idSede=${idSede}`
      : '/reportes/estadisticas/medicos-mas-consultas';
    return await apiClient.get(url);
  },

  // Tiempo promedio entre la cita y el registro de diagnóstico
  async getTiempoPromedioDiagnostico(idSede?: number) {
    const url = idSede 
      ? `/reportes/estadisticas/tiempo-promedio-diagnostico?idSede=${idSede}`
      : '/reportes/estadisticas/tiempo-promedio-diagnostico';
    return await apiClient.get(url);
  },

  // Últimos accesos a la tabla Historias_Clinicas
  async getUltimosAccesosHistoriales(limite: number = 10) {
    return await apiClient.get(`/auditoria/estadisticas/ultimos-accesos-historiales?limite=${limite}`);
  },

  // Departamentos que comparten equipamiento con otra sede
  async getDepartamentosEquipamientoCompartido(idSede?: number) {
    const url = idSede 
      ? `/reportes/estadisticas/departamentos-equipamiento-compartido?idSede=${idSede}`
      : '/reportes/estadisticas/departamentos-equipamiento-compartido';
    return await apiClient.get(url);
  },

  // Total de pacientes atendidos por enfermedad y por sede
  async getPacientesPorEnfermedad(params?: { idSede?: number; fechaInicio?: string; fechaFin?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.idSede) queryParams.append('idSede', params.idSede.toString());
    if (params?.fechaInicio) queryParams.append('fechaInicio', params.fechaInicio);
    if (params?.fechaFin) queryParams.append('fechaFin', params.fechaFin);
    
    const url = queryParams.toString()
      ? `/reportes/estadisticas/pacientes-por-enfermedad?${queryParams.toString()}`
      : '/reportes/estadisticas/pacientes-por-enfermedad';
    return await apiClient.get(url);
  },

  // Vista consolidada de historias clínicas entre todas las sedes
  async getHistorialesConsolidados(codPac?: number) {
    const url = codPac 
      ? `/historiales/consolidado/todas-sedes?codPac=${codPac}`
      : '/historiales/consolidado/todas-sedes';
    return await apiClient.get(url);
  },
};
