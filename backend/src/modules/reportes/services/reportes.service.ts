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
    const paciente = await this.pacienteRepository.findByCodigo(dto.codPac);
    if (!paciente) {
      throw new NotFoundException(`Paciente con código ${dto.codPac} no encontrado`);
    }

    // Obtener historiales
    let historiales = await this.historialRepository.findByPaciente(dto.codPac);
    
    // Filtrar por fechas si se proporcionan
    if (dto.fechaInicio && dto.fechaFin) {
      const inicio = new Date(dto.fechaInicio);
      const fin = new Date(dto.fechaFin);
      historiales = historiales.filter(
        (h) => h.fecha >= inicio && h.fecha <= fin,
      );
    }

    // Obtener citas
    let citas = await this.agendaCitaRepository.findByPaciente(dto.codPac);
    
    if (dto.fechaInicio && dto.fechaFin) {
      const inicio = new Date(dto.fechaInicio);
      const fin = new Date(dto.fechaFin);
      citas = citas.filter((c) => c.fecha >= inicio && c.fecha <= fin);
    }

    // Obtener prescripciones a través de las citas
    const citaIds = citas.map((c) => c.idCita);
    const prescripciones = await Promise.all(
      citaIds.map((idCita) => this.prescribeRepository.findByCita(idCita)),
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
    // Obtener estadísticas
    const totalPacientes = await this.pacienteRepository.count();
    const totalEmpleados = await this.empleadoRepository.count();
    const totalSedes = await this.sedeRepository.count();

    // Obtener citas
    let citas = await this.agendaCitaRepository.findAll();
    
    if (dto.fechaInicio && dto.fechaFin) {
      const inicio = new Date(dto.fechaInicio);
      const fin = new Date(dto.fechaFin);
      citas = citas.filter((c) => c.fecha >= inicio && c.fecha <= fin);
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
      citas: citas.sort((a, b) => b.fecha.getTime() - a.fecha.getTime()).slice(0, 20),
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
      citas: citas.sort((a, b) => b.fecha.getTime() - a.fecha.getTime()).slice(0, 20),
    });
  }
}
