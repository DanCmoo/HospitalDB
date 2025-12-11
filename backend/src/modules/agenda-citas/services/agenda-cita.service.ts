import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { AgendaCitaRepository } from '../repositories/agenda-cita.repository';
import { CreateAgendaCitaDto, UpdateAgendaCitaDto, AgendaCitaResponseDto } from '../dtos';
import { Between } from 'typeorm';
import { SedeConfig } from '../../../config/sede.config';

@Injectable()
export class AgendaCitaService {
  constructor(
    private readonly agendaCitaRepository: AgendaCitaRepository,
  ) {}

  async findAll(): Promise<AgendaCitaResponseDto[]> {
    const citas = await this.agendaCitaRepository.findAll();
    return citas.map((cita) => this.mapToResponse(cita));
  }

  async findById(idCita: number, idSede?: number): Promise<AgendaCitaResponseDto> {
    const sede = idSede || SedeConfig.getIdSede();
    const cita = await this.agendaCitaRepository.findById(idCita, sede);
    if (!cita) {
      throw new NotFoundException(`Cita con ID ${idCita} no encontrada`);
    }
    return this.mapToResponse(cita);
  }

  async findByEstado(estado: string): Promise<AgendaCitaResponseDto[]> {
    const citas = await this.agendaCitaRepository.findByEstado(estado);
    return citas.map((cita) => this.mapToResponse(cita));
  }

  async findByEmpleado(idEmp: number, idSede?: number): Promise<AgendaCitaResponseDto[]> {
    const sede = idSede || SedeConfig.getIdSede();
    const citas = await this.agendaCitaRepository.findByEmpleado(idEmp, sede);
    return citas.map((cita) => this.mapToResponse(cita));
  }

  async findByPaciente(codPac: number, idSede?: number): Promise<AgendaCitaResponseDto[]> {
    const sede = idSede || SedeConfig.getIdSede();
    const citas = await this.agendaCitaRepository.findByPaciente(codPac, sede);
    return citas.map((cita) => this.mapToResponse(cita));
  }

  async findByFecha(fecha: string): Promise<AgendaCitaResponseDto[]> {
    const citas = await this.agendaCitaRepository.findByFecha(new Date(fecha));
    return citas.map((cita) => this.mapToResponse(cita));
  }

  async findByFechaRango(fechaInicio: string, fechaFin: string): Promise<AgendaCitaResponseDto[]> {
    const citas = await this.agendaCitaRepository.findByFechaRango(new Date(fechaInicio), new Date(fechaFin));
    return citas.map((cita) => this.mapToResponse(cita));
  }

  async findBySede(idSede: number): Promise<AgendaCitaResponseDto[]> {
    const citas = await this.agendaCitaRepository.findBySede(idSede);
    return citas.map((cita) => this.mapToResponse(cita));
  }

  async create(dto: CreateAgendaCitaDto): Promise<AgendaCitaResponseDto> {
    // Validar que no haya conflicto de horario para el empleado
    const conflictos = await this.agendaCitaRepository.findByEmpleadoAndFecha(dto.idEmp, new Date(dto.fecha));
    const tieneConflicto = conflictos.some((cita) => cita.hora === dto.hora && cita.estado !== 'Cancelada');
    
    if (tieneConflicto) {
      throw new BadRequestException(`El empleado ya tiene una cita programada a las ${dto.hora} el ${dto.fecha}`);
    }

    const cita = await this.agendaCitaRepository.create({
      ...dto,
      fecha: new Date(dto.fecha),
    });
    return this.mapToResponse(cita);
  }

  async update(idCita: number, dto: UpdateAgendaCitaDto, idSede?: number): Promise<AgendaCitaResponseDto> {
    const sede = idSede || SedeConfig.getIdSede();
    const existing = await this.agendaCitaRepository.findById(idCita, sede);
    if (!existing) {
      throw new NotFoundException(`Cita con ID ${idCita} no encontrada`);
    }

    // Si se actualiza fecha/hora, validar conflictos
    if (dto.fecha || dto.hora) {
      const fecha = dto.fecha ? new Date(dto.fecha) : existing.fecha;
      const hora = dto.hora || existing.hora;
      const conflictos = await this.agendaCitaRepository.findByEmpleadoAndFecha(existing.idEmp, fecha);
      const tieneConflicto = conflictos.some(
        (cita) => cita.idCita !== idCita && cita.hora === hora && cita.estado !== 'Cancelada',
      );

      if (tieneConflicto) {
        throw new BadRequestException(`El empleado ya tiene una cita programada a las ${hora} el ${fecha}`);
      }
    }

    const updated = await this.agendaCitaRepository.update(idCita, sede, {
      ...dto,
      fecha: dto.fecha ? new Date(dto.fecha) : undefined,
    });
    return this.mapToResponse(updated);
  }

  async delete(idCita: number, idSede?: number): Promise<void> {
    const sede = idSede || SedeConfig.getIdSede();
    const existing = await this.agendaCitaRepository.findById(idCita, sede);
    if (!existing) {
      throw new NotFoundException(`Cita con ID ${idCita} no encontrada`);
    }
    await this.agendaCitaRepository.delete(idCita, sede);
  }

  async count(): Promise<number> {
    return this.agendaCitaRepository.count();
  }

  async findWithPagination(page: number, limit: number) {
    return this.agendaCitaRepository.findWithPagination(page, limit);
  }

  private mapToResponse(cita: any): AgendaCitaResponseDto {
    return {
      idCita: cita.idCita,
      fecha: cita.fecha,
      hora: cita.hora,
      tipoServicio: cita.tipoServicio,
      estado: cita.estado,
      idSede: cita.idSede,
      nomDept: cita.nomDept,
      idEmp: cita.idEmp,
      codPac: cita.codPac,
      empleado: cita.empleado
        ? {
            idEmp: cita.empleado.idEmp,
            cargo: cita.empleado.cargo,
            persona: cita.empleado.persona
              ? {
                  nomPers: cita.empleado.persona.nomPers,
                  correo: cita.empleado.persona.correo,
                  telPers: cita.empleado.persona.telPers,
                }
              : undefined,
          }
        : undefined,
      paciente: cita.paciente
        ? {
            codPac: cita.paciente.codPac,
            numDoc: cita.paciente.numDoc,
            genero: cita.paciente.genero,
            persona: cita.paciente.persona
              ? {
                  nomPers: cita.paciente.persona.nomPers,
                  correo: cita.paciente.persona.correo,
                  telPers: cita.paciente.persona.telPers,
                }
              : undefined,
          }
        : undefined,
      prescripciones: cita.prescripciones
        ? cita.prescripciones.map((p: any) => ({
            codMed: p.codMed,
            dosis: p.dosis,
            frecuencia: p.frecuencia,
            duracion: p.duracion,
            fechaEmision: p.fechaEmision,
            medicamento: p.medicamento
              ? {
                  nomMed: p.medicamento.nomMed,
                }
              : undefined,
          }))
        : undefined,
    };
  }
}
