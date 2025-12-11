import { Injectable, NotFoundException } from '@nestjs/common';
import { AuditoriaRepository } from '../repositories/auditoria.repository';
import { CreateAuditoriaDto, AuditoriaResponseDto } from '../dtos';

@Injectable()
export class AuditoriaService {
  constructor(
    private readonly auditoriaRepository: AuditoriaRepository,
  ) {}

  async findAll(): Promise<AuditoriaResponseDto[]> {
    const eventos = await this.auditoriaRepository.findAll();
    return eventos.map((evt) => this.mapToResponse(evt));
  }

  async findById(idEvento: number): Promise<AuditoriaResponseDto> {
    const evento = await this.auditoriaRepository.findById(idEvento);
    if (!evento) {
      throw new NotFoundException(`Evento de auditoría con ID ${idEvento} no encontrado`);
    }
    return this.mapToResponse(evento);
  }

  async findByPersona(numDoc: string): Promise<AuditoriaResponseDto[]> {
    const eventos = await this.auditoriaRepository.findByPersona(numDoc);
    return eventos.map((evt) => this.mapToResponse(evt));
  }

  async findByAccion(accion: string): Promise<AuditoriaResponseDto[]> {
    const eventos = await this.auditoriaRepository.findByAccion(accion);
    return eventos.map((evt) => this.mapToResponse(evt));
  }

  async findByTabla(tablaAfectada: string): Promise<AuditoriaResponseDto[]> {
    const eventos = await this.auditoriaRepository.findByTabla(tablaAfectada);
    return eventos.map((evt) => this.mapToResponse(evt));
  }

  async findByFecha(fechaEvento: string): Promise<AuditoriaResponseDto[]> {
    const eventos = await this.auditoriaRepository.findByFecha(new Date(fechaEvento));
    return eventos.map((evt) => this.mapToResponse(evt));
  }

  async findByFechaRango(fechaInicio: string, fechaFin: string): Promise<AuditoriaResponseDto[]> {
    const eventos = await this.auditoriaRepository.findByFechaRango(new Date(fechaInicio), new Date(fechaFin));
    return eventos.map((evt) => this.mapToResponse(evt));
  }

  async create(dto: CreateAuditoriaDto): Promise<AuditoriaResponseDto> {
    const evento = await this.auditoriaRepository.create({
      ...dto,
      fechaEvento: new Date(dto.fechaEvento),
    });
    return this.mapToResponse(evento);
  }

  async delete(idEvento: number): Promise<void> {
    const existing = await this.auditoriaRepository.findById(idEvento);
    if (!existing) {
      throw new NotFoundException(`Evento de auditoría con ID ${idEvento} no encontrado`);
    }
    await this.auditoriaRepository.delete(idEvento);
  }

  async count(): Promise<number> {
    return this.auditoriaRepository.count();
  }

  async findWithPagination(page: number, limit: number) {
    return this.auditoriaRepository.findWithPagination(page, limit);
  }

  async findUltimosAccesosHistoriales(limite: number = 10): Promise<AuditoriaResponseDto[]> {
    // Buscar accesos a la tabla de historiales (Emite_Hist o similar)
    const eventos = await this.auditoriaRepository.findByTabla('Emite_Hist');
    
    // Ordenar por fecha descendente y limitar
    const eventosOrdenados = eventos
      .sort((a, b) => new Date(b.fechaEvento).getTime() - new Date(a.fechaEvento).getTime())
      .slice(0, limite);
    
    return eventosOrdenados.map((evt) => this.mapToResponse(evt));
  }

  private mapToResponse(evento: any): AuditoriaResponseDto {
    return {
      idEvento: evento.idEvento,
      numDoc: evento.numDoc,
      accion: evento.accion,
      fechaEvento: evento.fechaEvento,
      tablaAfectada: evento.tablaAfectada,
      ipOrigen: evento.ipOrigen,
      persona: evento.persona
        ? {
            numDoc: evento.persona.numDoc,
            nomPers: evento.persona.nomPers,
            correo: evento.persona.correo,
            telPers: evento.persona.telPers,
          }
        : undefined,
    };
  }
}
