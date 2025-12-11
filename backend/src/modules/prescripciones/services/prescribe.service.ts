import { Injectable, NotFoundException } from '@nestjs/common';
import { PrescribeRepository } from '../repositories/prescribe.repository';
import { CreatePrescribeDto, UpdatePrescribeDto, PrescribeResponseDto } from '../dtos';

@Injectable()
export class PrescribeService {
  constructor(
    private readonly prescribeRepository: PrescribeRepository,
  ) {}

  async findAll(): Promise<PrescribeResponseDto[]> {
    const prescripciones = await this.prescribeRepository.findAll();
    return prescripciones.map((p) => this.mapToResponse(p));
  }

  async findOne(codMed: number, idCita: number): Promise<PrescribeResponseDto> {
    const prescripcion = await this.prescribeRepository.findOne(codMed, idCita);
    if (!prescripcion) {
      throw new NotFoundException(`Prescripción con codMed=${codMed}, idCita=${idCita} no encontrada`);
    }
    return this.mapToResponse(prescripcion);
  }

  async findByCita(idCita: number): Promise<PrescribeResponseDto[]> {
    const prescripciones = await this.prescribeRepository.findByCita(idCita);
    return prescripciones.map((p) => this.mapToResponse(p));
  }

  async findByMedicamento(codMed: number): Promise<PrescribeResponseDto[]> {
    const prescripciones = await this.prescribeRepository.findByMedicamento(codMed);
    return prescripciones.map((p) => this.mapToResponse(p));
  }

  async create(dto: CreatePrescribeDto): Promise<PrescribeResponseDto> {
    const prescripcion = await this.prescribeRepository.create({
      ...dto,
      duracion: new Date(dto.duracion),
      fechaEmision: new Date(dto.fechaEmision),
    });
    return this.mapToResponse(prescripcion);
  }

  async update(codMed: number, idCita: number, dto: UpdatePrescribeDto): Promise<PrescribeResponseDto> {
    const existing = await this.prescribeRepository.findOne(codMed, idCita);
    if (!existing) {
      throw new NotFoundException(`Prescripción con codMed=${codMed}, idCita=${idCita} no encontrada`);
    }

    const updated = await this.prescribeRepository.update(codMed, idCita, {
      ...dto,
      duracion: dto.duracion ? new Date(dto.duracion) : undefined,
      fechaEmision: dto.fechaEmision ? new Date(dto.fechaEmision) : undefined,
    });
    return this.mapToResponse(updated);
  }

  async delete(codMed: number, idCita: number): Promise<void> {
    const existing = await this.prescribeRepository.findOne(codMed, idCita);
    if (!existing) {
      throw new NotFoundException(`Prescripción con codMed=${codMed}, idCita=${idCita} no encontrada`);
    }
    await this.prescribeRepository.delete(codMed, idCita);
  }

  async count(): Promise<number> {
    return this.prescribeRepository.count();
  }

  private mapToResponse(prescripcion: any): PrescribeResponseDto {
    return {
      codMed: prescripcion.codMed,
      idCita: prescripcion.idCita,
      dosis: prescripcion.dosis,
      frecuencia: prescripcion.frecuencia,
      duracion: prescripcion.duracion,
      fechaEmision: prescripcion.fechaEmision,
      medicamento: prescripcion.medicamento
        ? {
            codMed: prescripcion.medicamento.codMed,
            nomMed: prescripcion.medicamento.nomMed,
            stock: prescripcion.medicamento.stock,
          }
        : undefined,
      cita: prescripcion.cita
        ? {
            idCita: prescripcion.cita.idCita,
            fecha: prescripcion.cita.fecha,
            tipoServicio: prescripcion.cita.tipoServicio,
            paciente: prescripcion.cita.paciente
              ? {
                  codPac: prescripcion.cita.paciente.codPac,
                  persona: prescripcion.cita.paciente.persona
                    ? {
                        nomPers: prescripcion.cita.paciente.persona.nomPers,
                      }
                    : undefined,
                }
              : undefined,
          }
        : undefined,
    };
  }
}
