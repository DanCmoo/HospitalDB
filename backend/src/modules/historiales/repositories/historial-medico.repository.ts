import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { HistorialMedicoEntity } from '../entities/historial-medico.entity';

@Injectable()
export class HistorialMedicoRepository {
  constructor(
    @InjectRepository(HistorialMedicoEntity)
    private readonly repository: Repository<HistorialMedicoEntity>,
  ) {}

  async findAll(): Promise<HistorialMedicoEntity[]> {
    return this.repository.find({
      relations: ['empleado', 'empleado.persona', 'paciente', 'paciente.persona'],
      order: { fecha: 'DESC', hora: 'DESC' },
    });
  }

  async findById(codHist: number): Promise<HistorialMedicoEntity | null> {
    return this.repository.findOne({
      where: { codHist },
      relations: ['empleado', 'empleado.persona', 'paciente', 'paciente.persona'],
    });
  }

  async findByPaciente(codPac: number): Promise<HistorialMedicoEntity[]> {
    return this.repository.find({
      where: { codPac },
      relations: ['empleado', 'empleado.persona', 'paciente', 'paciente.persona'],
      order: { fecha: 'DESC', hora: 'DESC' },
    });
  }

  async findByEmpleado(idEmp: number): Promise<HistorialMedicoEntity[]> {
    return this.repository.find({
      where: { idEmp },
      relations: ['empleado', 'empleado.persona', 'paciente', 'paciente.persona'],
      order: { fecha: 'DESC', hora: 'DESC' },
    });
  }

  async findByFecha(fecha: Date): Promise<HistorialMedicoEntity[]> {
    return this.repository.find({
      where: { fecha },
      relations: ['empleado', 'empleado.persona', 'paciente', 'paciente.persona'],
      order: { hora: 'DESC' },
    });
  }

  async findByFechaRango(fechaInicio: Date, fechaFin: Date): Promise<HistorialMedicoEntity[]> {
    return this.repository.find({
      where: {
        fecha: Between(fechaInicio, fechaFin),
      },
      relations: ['empleado', 'empleado.persona', 'paciente', 'paciente.persona'],
      order: { fecha: 'DESC', hora: 'DESC' },
    });
  }

  async findBySede(idSede: number): Promise<HistorialMedicoEntity[]> {
    return this.repository.find({
      where: { idSede },
      relations: ['empleado', 'empleado.persona', 'paciente', 'paciente.persona'],
      order: { fecha: 'DESC', hora: 'DESC' },
    });
  }

  async create(data: Partial<HistorialMedicoEntity>): Promise<HistorialMedicoEntity> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async update(codHist: number, data: Partial<HistorialMedicoEntity>): Promise<HistorialMedicoEntity> {
    await this.repository.update(codHist, data);
    return this.findById(codHist);
  }

  async delete(codHist: number): Promise<void> {
    await this.repository.delete(codHist);
  }

  async count(): Promise<number> {
    return this.repository.count();
  }

  async getNextId(): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('hist')
      .select('MAX(hist.codHist)', 'max')
      .getRawOne();

    return (result?.max || 0) + 1;
  }

  async findWithPagination(page: number, limit: number): Promise<[HistorialMedicoEntity[], number]> {
    return this.repository.findAndCount({
      relations: ['empleado', 'empleado.persona', 'paciente', 'paciente.persona'],
      skip: (page - 1) * limit,
      take: limit,
      order: { fecha: 'DESC', hora: 'DESC' },
    });
  }
}
