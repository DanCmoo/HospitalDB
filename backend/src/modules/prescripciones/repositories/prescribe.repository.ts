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

  async findByCita(idCita: number): Promise<PrescribeEntity[]> {
    return this.repository.find({
      where: { idCita },
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

  async findOne(codMed: number, idCita: number): Promise<PrescribeEntity | null> {
    return this.repository.findOne({
      where: { codMed, idCita },
      relations: ['medicamento', 'cita', 'cita.paciente', 'cita.paciente.persona'],
    });
  }

  async create(data: Partial<PrescribeEntity>): Promise<PrescribeEntity> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async update(codMed: number, idCita: number, data: Partial<PrescribeEntity>): Promise<PrescribeEntity> {
    await this.repository.update({ codMed, idCita }, data);
    return this.findOne(codMed, idCita);
  }

  async delete(codMed: number, idCita: number): Promise<void> {
    await this.repository.delete({ codMed, idCita });
  }

  async count(): Promise<number> {
    return this.repository.count();
  }
}
