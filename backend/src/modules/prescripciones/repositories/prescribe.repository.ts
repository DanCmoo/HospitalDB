import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PrescribeEntity } from '../entities/prescribe.entity';

@Injectable()
export class PrescribeRepository {
  constructor(
    @InjectRepository(PrescribeEntity)
    private readonly repository: Repository<PrescribeEntity>,
  ) {}

  async findAll(): Promise<PrescribeEntity[]> {
    return this.repository.find({
      relations: ['medicamento', 'cita', 'cita.paciente', 'cita.paciente.persona'],
      order: { fechaEmision: 'DESC' },
    });
  }

  async findByCita(idCita: number, idSede: number): Promise<PrescribeEntity[]> {
    return this.repository.find({
      where: { idCita, idSede },
      relations: ['medicamento', 'cita'],
    });
  }

  async findByMedicamento(codMed: number): Promise<PrescribeEntity[]> {
    return this.repository.find({
      where: { codMed },
      relations: ['medicamento', 'cita', 'cita.paciente', 'cita.paciente.persona'],
      order: { fechaEmision: 'DESC' },
    });
  }

  async findOne(codMed: number, idCita: number, idSede: number): Promise<PrescribeEntity | null> {
    return this.repository.findOne({
      where: { codMed, idCita, idSede },
      relations: ['medicamento', 'cita', 'cita.paciente', 'cita.paciente.persona'],
    });
  }

  async create(data: Partial<PrescribeEntity>): Promise<PrescribeEntity> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async update(codMed: number, idCita: number, idSede: number, data: Partial<PrescribeEntity>): Promise<PrescribeEntity> {
    await this.repository.update({ codMed, idCita, idSede }, data);
    return this.findOne(codMed, idCita, idSede);
  }

  async delete(codMed: number, idCita: number, idSede: number): Promise<void> {
    await this.repository.delete({ codMed, idCita, idSede });
  }

  async count(): Promise<number> {
    return this.repository.count();
  }
}
