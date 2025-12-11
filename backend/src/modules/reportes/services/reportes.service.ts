import { Injectable, NotFoundException } from '@nestjs/common';
import { PdfGeneratorService } from './pdf-generator.service';
import { PacienteRepository } from '../../pacientes/repositories/paciente.repository';
import { SedeRepository } from '../../sedes/repositories/sede.repository';
import { AgendaCitaRepository } from '../../agenda-citas/repositories/agenda-cita.repository';
import { HistorialMedicoRepository } from '../../historiales/repositories/historial-medico.repository';
import { PrescribeRepository } from '../../prescripciones/repositories/prescribe.repository';
import { MedicamentoRepository } from '../../medicamentos/repositories/medicamento.repository';
import { EmpleadoRepository } from '../../empleados/repositories/empleado.repository';
import { DepartamentoRepository } from '../../departamentos/repositories/departamento.repository';
import { GenerarReportePacienteDto, GenerarReporteSedeDto, GenerarReporteGeneralDto } from '../dtos';
import { Between, LessThan } from 'typeorm';
import { SedeConfig } from '../../../config/sede.config';

@Injectable()
export class ReportesService {
  constructor(
    private readonly pdfGenerator: PdfGeneratorService,
    private readonly pacienteRepository: PacienteRepository,
    private readonly sedeRepository: SedeRepository,
    private readonly agendaCitaRepository: AgendaCitaRepository,
    private readonly historialRepository: HistorialMedicoRepository,
    private readonly prescribeRepository: PrescribeRepository,
    private readonly medicamentoRepository: MedicamentoRepository,
    private readonly empleadoRepository: EmpleadoRepository,
    private readonly departamentoRepository: DepartamentoRepository,
  ) {}

  /**
   * Genera reporte completo de un paciente
   */
  async generarReportePaciente(dto: GenerarReportePacienteDto): Promise<Buffer> {
    const idSede = SedeConfig.getIdSede();
    const paciente = await this.pacienteRepository.findByCodigo(dto.codPac, idSede);
    if (!paciente) {
      throw new NotFoundException(`Paciente con código ${dto.codPac} no encontrado`);
    }

    // Obtener historiales
    let historiales = await this.historialRepository.findByPaciente(dto.codPac, idSede);
    
    // Filtrar por fechas si se proporcionan
    if (dto.fechaInicio && dto.fechaFin) {
      const inicio = new Date(dto.fechaInicio);
      const fin = new Date(dto.fechaFin);
      historiales = historiales.filter(
        (h) => h.fecha >= inicio && h.fecha <= fin,
      );
    }

    // Obtener citas
    let citas = await this.agendaCitaRepository.findByPaciente(dto.codPac, idSede);
    
    if (dto.fechaInicio && dto.fechaFin) {
      const inicio = new Date(dto.fechaInicio);
      const fin = new Date(dto.fechaFin);
      citas = citas.filter((c) => c.fecha >= inicio && c.fecha <= fin);
    }

    // Obtener prescripciones a través de las citas
    const citaIds = citas.map((c) => c.idCita);
    const prescripciones = await Promise.all(
      citaIds.map((idCita) => this.prescribeRepository.findByCita(idCita, idSede)),
    );
    const todasPrescripciones = prescripciones.flat();

    return this.pdfGenerator.generarReportePaciente({
      paciente,
      historiales,
      citas,
      prescripciones: todasPrescripciones,
    });
  }

  /**
   * Genera reporte general del hospital
   */
  async generarReporteGeneral(dto: GenerarReporteGeneralDto): Promise<Buffer> {
    const idSede = SedeConfig.getIdSede();
    const totalPacientes = await this.pacienteRepository.count();
    const totalEmpleados = await this.empleadoRepository.count();
    const totalSedes = await this.sedeRepository.count();

    // Obtener citas
    let citas = await this.agendaCitaRepository.findAll();
    if (dto.fechaInicio && dto.fechaFin) {
      const inicio = new Date(dto.fechaInicio);
      const fin = new Date(dto.fechaFin);
      citas = citas.filter((c) => new Date(c.fecha) >= inicio && new Date(c.fecha) <= fin);
    }

    const citasProgramadas = citas.filter((c) => c.estado === 'Programada').length;
    const citasCompletadas = citas.filter((c) => c.estado === 'Completada').length;
    const citasCanceladas = citas.filter((c) => c.estado === 'Cancelada').length;

    // Medicamentos con stock bajo (menos de 50 unidades)
    const todosMedicamentos = await this.medicamentoRepository.findAll();
    const medicamentosStockBajo = todosMedicamentos.filter((m) => m.stock < 50);

    return this.pdfGenerator.generarReporteGeneral({
      estadisticas: {
        totalPacientes,
        totalEmpleados,
        totalSedes,
        citasProgramadas,
        citasCompletadas,
        citasCanceladas,
      },
      citas: citas.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()).slice(0, 20),
      medicamentosStockBajo,
    });
  }

  /**
   * Genera reporte de una sede hospitalaria
   */
  async generarReporteSede(dto: GenerarReporteSedeDto): Promise<Buffer> {
    const sede = await this.sedeRepository.findById(dto.idSede);
    if (!sede) {
      throw new NotFoundException(`Sede con ID ${dto.idSede} no encontrada`);
    }

    // Obtener departamentos de la sede
    const departamentos = await this.departamentoRepository.findBySede(dto.idSede);

    // Obtener empleados de la sede - filtrar manualmente
    const todosEmpleados = await this.empleadoRepository.findAll();
    const empleados = todosEmpleados.filter((emp) => {
      // Los empleados están relacionados con sedes a través de departamentos
      // Por simplicidad, incluimos todos los empleados
      return true;
    });

    // Obtener citas de la sede
    let citas = await this.agendaCitaRepository.findBySede(dto.idSede);
    if (dto.fechaInicio && dto.fechaFin) {
      const inicio = new Date(dto.fechaInicio);
      const fin = new Date(dto.fechaFin);
      citas = citas.filter((c) => c.fecha >= inicio && c.fecha <= fin);
    }

    return this.pdfGenerator.generarReporteSede({
      sede,
      departamentos,
      empleados,
      citas: citas.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()).slice(0, 20),
    });
  }

  /**
   * Listar los medicamentos más recetados por sede en el último mes
   */
  async obtenerMedicamentosMasRecetados(idSede?: number): Promise<any[]> {
    const sede = idSede || SedeConfig.getIdSede();
    
    // Fecha hace 1 mes
    const fechaLimite = new Date();
    fechaLimite.setMonth(fechaLimite.getMonth() - 1);

    // Obtener todas las prescripciones del último mes
    const todasPrescripciones = await this.prescribeRepository.findAll();
    const prescripciones = todasPrescripciones.filter(p => p.idSede === sede);
    
    // Filtrar por fecha (usando la fecha de la cita asociada)
    const prescripcionesMes = prescripciones.filter(p => {
      if (p.cita && p.cita.fecha) {
        return new Date(p.cita.fecha) >= fechaLimite;
      }
      return false;
    });

    // Agrupar por medicamento y contar
    const medicamentosCount = new Map<number, { medicamento: any; cantidad: number }>();
    
    for (const prescripcion of prescripcionesMes) {
      const codMed = prescripcion.codMed;
      if (medicamentosCount.has(codMed)) {
        medicamentosCount.get(codMed).cantidad++;
      } else {
        medicamentosCount.set(codMed, {
          medicamento: prescripcion.medicamento,
          cantidad: 1,
        });
      }
    }

    // Convertir a array y ordenar
    const resultado = Array.from(medicamentosCount.values())
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 10); // Top 10

    return resultado;
  }

  /**
   * Mostrar los médicos con mayor número de consultas atendidas por semana
   */
  async obtenerMedicosConMasConsultas(idSede?: number): Promise<any[]> {
    const sede = idSede || SedeConfig.getIdSede();
    
    // Fecha hace 1 semana
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - 7);

    // Obtener todas las citas completadas de la última semana
    const citas = await this.agendaCitaRepository.findBySede(sede);
    
    const citasSemana = citas.filter(c => 
      c.estado === 'Completada' && new Date(c.fecha) >= fechaLimite
    );

    // Agrupar por empleado (médico) y contar
    const medicosCount = new Map<number, { empleado: any; consultas: number }>();
    
    for (const cita of citasSemana) {
      const idEmp = cita.idEmp;
      if (medicosCount.has(idEmp)) {
        medicosCount.get(idEmp).consultas++;
      } else {
        medicosCount.set(idEmp, {
          empleado: cita.empleado,
          consultas: 1,
        });
      }
    }

    // Convertir a array y ordenar
    const resultado = Array.from(medicosCount.values())
      .sort((a, b) => b.consultas - a.consultas)
      .slice(0, 10); // Top 10

    return resultado;
  }

  /**
   * Reportar el tiempo promedio entre la cita y el registro de diagnóstico
   */
  async obtenerTiempoPromedioDiagnostico(idSede?: number): Promise<any> {
    const sede = idSede || SedeConfig.getIdSede();

    // Obtener todas las citas completadas
    const citas = await this.agendaCitaRepository.findBySede(sede);
    const citasCompletadas = citas.filter(c => c.estado === 'Completada');

    let tiemposTotales = 0;
    let contadorValidos = 0;

    for (const cita of citasCompletadas) {
      // Buscar historial médico correspondiente
      const historiales = await this.historialRepository.findByPaciente(cita.codPac, sede);
      
      // Buscar historial del mismo día o cercano
      const historialRelacionado = historiales.find(h => {
        const fechaCita = new Date(cita.fecha);
        const fechaHistorial = new Date(h.fecha);
        const difDias = Math.abs(fechaCita.getTime() - fechaHistorial.getTime()) / (1000 * 60 * 60 * 24);
        return difDias <= 1; // Mismo día o día siguiente
      });

      if (historialRelacionado) {
        // Calcular diferencia de tiempo
        const fechaHoraCita = new Date(`${cita.fecha}T${cita.hora}`);
        const fechaHoraHistorial = new Date(`${historialRelacionado.fecha}T${historialRelacionado.hora}`);
        
        const diferenciaMinutos = (fechaHoraHistorial.getTime() - fechaHoraCita.getTime()) / (1000 * 60);
        
        if (diferenciaMinutos >= 0) { // Solo contar si el historial es posterior
          tiemposTotales += diferenciaMinutos;
          contadorValidos++;
        }
      }
    }

    const promedioMinutos = contadorValidos > 0 ? tiemposTotales / contadorValidos : 0;
    const promedioHoras = promedioMinutos / 60;

    return {
      promedioMinutos: Math.round(promedioMinutos),
      promedioHoras: Math.round(promedioHoras * 100) / 100,
      citasAnalizadas: citasCompletadas.length,
      citasConHistorial: contadorValidos,
    };
  }

  /**
   * Calcular el total de pacientes atendidos por enfermedad y por sede
   */
  async obtenerPacientesPorEnfermedad(dto: any): Promise<any[]> {
    const sede = dto.idSede || SedeConfig.getIdSede();

    // Obtener todos los historiales
    let historiales = await this.historialRepository.findBySede(sede);

    // Filtrar por fechas si se proporcionan
    if (dto.fechaInicio && dto.fechaFin) {
      const inicio = new Date(dto.fechaInicio);
      const fin = new Date(dto.fechaFin);
      historiales = historiales.filter(h => {
        const fecha = new Date(h.fecha);
        return fecha >= inicio && fecha <= fin;
      });
    }

    // Agrupar por diagnóstico (enfermedad)
    const enfermedadesCount = new Map<string, { diagnostico: string; pacientes: Set<number>; total: number }>();

    for (const historial of historiales) {
      const diagnostico = historial.diagnostico || 'Sin diagnóstico';
      
      if (enfermedadesCount.has(diagnostico)) {
        enfermedadesCount.get(diagnostico).pacientes.add(historial.codPac);
      } else {
        const pacientesSet = new Set<number>();
        pacientesSet.add(historial.codPac);
        enfermedadesCount.set(diagnostico, {
          diagnostico,
          pacientes: pacientesSet,
          total: 0,
        });
      }
    }

    // Convertir a array con conteo
    const resultado = Array.from(enfermedadesCount.values()).map(item => ({
      diagnostico: item.diagnostico,
      totalPacientes: item.pacientes.size,
      totalRegistros: historiales.filter(h => h.diagnostico === item.diagnostico).length,
      idSede: sede,
    })).sort((a, b) => b.totalPacientes - a.totalPacientes);

    return resultado;
  }

  /**
   * Consultar los departamentos que comparten equipamiento con otra sede
   */
  async obtenerDepartamentosEquipamientoCompartido(idSede?: number): Promise<any[]> {
    const sedeActual = idSede || SedeConfig.getIdSede();
    
    // Obtener todos los departamentos de la sede actual
    const departamentosActuales = await this.departamentoRepository.findBySede(sedeActual);
    
    const resultado = [];

    for (const dept of departamentosActuales) {
      // Buscar si este departamento tiene equipamiento
      if (dept.equipamientos && dept.equipamientos.length > 0) {
        for (const equipo of dept.equipamientos) {
          // Verificar si este equipo está asignado a departamentos de otras sedes
          const todosDepartamentos = await this.departamentoRepository.findAll();
          
          const departamentosConMismoEquipo = todosDepartamentos.filter(d => 
            d.idSede !== sedeActual && 
            d.equipamientos && 
            d.equipamientos.some(e => e.codEq === equipo.codEq)
          );

          if (departamentosConMismoEquipo.length > 0) {
            resultado.push({
              departamentoActual: dept.nomDept,
              sedeActual: dept.sede?.nomSede,
              equipamiento: equipo.nomEq,
              compartidoCon: departamentosConMismoEquipo.map(d => ({
                departamento: d.nomDept,
                sede: d.sede?.nomSede,
              })),
            });
          }
        }
      }
    }

    return resultado;
  }
}
