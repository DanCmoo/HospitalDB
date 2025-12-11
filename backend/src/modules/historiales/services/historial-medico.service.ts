import { Injectable, NotFoundException } from '@nestjs/common';
import { HistorialMedicoRepository } from '../repositories/historial-medico.repository';
import { CreateHistorialMedicoDto, UpdateHistorialMedicoDto, HistorialMedicoResponseDto } from '../dtos';

@Injectable()
export class HistorialMedicoService {
  constructor(
    private readonly historialRepository: HistorialMedicoRepository,
  ) {}

  async findAll(): Promise<HistorialMedicoResponseDto[]> {
    const historiales = await this.historialRepository.findAll();
    return historiales.map((hist) => this.mapToResponse(hist));
  }

  async findById(codHist: number): Promise<HistorialMedicoResponseDto> {
    const historial = await this.historialRepository.findById(codHist);
    if (!historial) {
      throw new NotFoundException(`Historial con ID ${codHist} no encontrado`);
    }
    return this.mapToResponse(historial);
  }

  async findByPaciente(codPac: number): Promise<HistorialMedicoResponseDto[]> {
    const historiales = await this.historialRepository.findByPaciente(codPac);
    return historiales.map((hist) => this.mapToResponse(hist));
  }

  async findByEmpleado(idEmp: number): Promise<HistorialMedicoResponseDto[]> {
    const historiales = await this.historialRepository.findByEmpleado(idEmp);
    return historiales.map((hist) => this.mapToResponse(hist));
  }

  async findByFecha(fecha: string): Promise<HistorialMedicoResponseDto[]> {
    const historiales = await this.historialRepository.findByFecha(new Date(fecha));
    return historiales.map((hist) => this.mapToResponse(hist));
  }

  async findByFechaRango(fechaInicio: string, fechaFin: string): Promise<HistorialMedicoResponseDto[]> {
    const historiales = await this.historialRepository.findByFechaRango(new Date(fechaInicio), new Date(fechaFin));
    return historiales.map((hist) => this.mapToResponse(hist));
  }

  async findBySede(idSede: number): Promise<HistorialMedicoResponseDto[]> {
    const historiales = await this.historialRepository.findBySede(idSede);
    return historiales.map((hist) => this.mapToResponse(hist));
  }

  async create(dto: CreateHistorialMedicoDto): Promise<HistorialMedicoResponseDto> {
    const historial = await this.historialRepository.create({
      ...dto,
      fecha: new Date(dto.fecha),
    });
    return this.mapToResponse(historial);
  }

  async update(codHist: number, dto: UpdateHistorialMedicoDto): Promise<HistorialMedicoResponseDto> {
    const existing = await this.historialRepository.findById(codHist);
    if (!existing) {
      throw new NotFoundException(`Historial con ID ${codHist} no encontrado`);
    }

    const updated = await this.historialRepository.update(codHist, {
      ...dto,
      fecha: dto.fecha ? new Date(dto.fecha) : undefined,
    });
    return this.mapToResponse(updated);
  }

  async delete(codHist: number): Promise<void> {
    const existing = await this.historialRepository.findById(codHist);
    if (!existing) {
      throw new NotFoundException(`Historial con ID ${codHist} no encontrado`);
    }
    await this.historialRepository.delete(codHist);
  }

  async count(): Promise<number> {
    return this.historialRepository.count();
  }

  async findWithPagination(page: number, limit: number) {
    return this.historialRepository.findWithPagination(page, limit);
  }

  private mapToResponse(historial: any): HistorialMedicoResponseDto {
    return {
      codHist: historial.codHist,
      fecha: historial.fecha,
      hora: historial.hora,
      diagnostico: historial.diagnostico,
      idSede: historial.idSede,
      nomDept: historial.nomDept,
      idEmp: historial.idEmp,
      codPac: historial.codPac,
      empleado: historial.empleado
        ? {
            idEmp: historial.empleado.idEmp,
            cargo: historial.empleado.cargo,
            persona: historial.empleado.persona
              ? {
                  nomPers: historial.empleado.persona.nomPers,
                  correo: historial.empleado.persona.correo,
                  telPers: historial.empleado.persona.telPers,
                }
              : undefined,
          }
        : undefined,
      paciente: historial.paciente
        ? {
            codPac: historial.paciente.codPac,
            numDoc: historial.paciente.numDoc,
            genero: historial.paciente.genero,
            persona: historial.paciente.persona
              ? {
                  nomPers: historial.paciente.persona.nomPers,
                  correo: historial.paciente.persona.correo,
                  telPers: historial.paciente.persona.telPers,
                }
              : undefined,
          }
        : undefined,
    };
  }
}
