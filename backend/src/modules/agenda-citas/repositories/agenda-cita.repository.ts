import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { AgendaCitaEntity } from '../entities/agenda-cita.entity';

@Injectable()
export class AgendaCitaRepository {
  constructor(
    @InjectRepository(AgendaCitaEntity)
    private readonly repository: Repository<AgendaCitaEntity>,
  ) {}

  async findAll(): Promise<AgendaCitaEntity[]> {
    return this.repository.find({
      relations: ['empleado', 'empleado.persona', 'paciente', 'paciente.persona'],
      order: { fecha: 'DESC', hora: 'DESC' },
    });
  }

  async findById(idCita: number): Promise<AgendaCitaEntity | null> {
    return this.repository.findOne({
      where: { idCita },
      relations: ['empleado', 'empleado.persona', 'paciente', 'paciente.persona', 'prescripciones', 'prescripciones.medicamento'],
    });
  }

  async findByEstado(estado: string): Promise<AgendaCitaEntity[]> {
    return this.repository.find({
      where: { estado },
      relations: ['empleado', 'empleado.persona', 'paciente', 'paciente.persona'],
      order: { fecha: 'DESC', hora: 'DESC' },
    });
  }

  async findByEmpleado(idEmp: number): Promise<AgendaCitaEntity[]> {
    return this.repository.find({
      where: { idEmp },
      relations: ['empleado', 'empleado.persona', 'paciente', 'paciente.persona'],
      order: { fecha: 'DESC', hora: 'DESC' },
    });
  }

  async findByPaciente(codPac: number): Promise<AgendaCitaEntity[]> {
    return this.repository.find({
      where: { codPac },
      relations: ['empleado', 'empleado.persona', 'paciente', 'paciente.persona'],
      order: { fecha: 'DESC', hora: 'DESC' },
    });
  }

  async findByFecha(fecha: Date): Promise<AgendaCitaEntity[]> {
    return this.repository.find({
      where: { fecha },
      relations: ['empleado', 'empleado.persona', 'paciente', 'paciente.persona'],
      order: { hora: 'ASC' },
    });
  }

  async findByFechaRango(fechaInicio: Date, fechaFin: Date): Promise<AgendaCitaEntity[]> {
    return this.repository.find({
      where: {
        fecha: Between(fechaInicio, fechaFin),
      },
      relations: ['empleado', 'empleado.persona', 'paciente', 'paciente.persona'],
      order: { fecha: 'ASC', hora: 'ASC' },
    });
  }

  async findBySede(idSede: number): Promise<AgendaCitaEntity[]> {
    return this.repository.find({
      where: { idSede },
      relations: ['empleado', 'empleado.persona', 'paciente', 'paciente.persona'],
      order: { fecha: 'DESC', hora: 'DESC' },
    });
  }

  async findByEmpleadoAndFecha(idEmp: number, fecha: Date): Promise<AgendaCitaEntity[]> {
    return this.repository.find({
      where: { idEmp, fecha },
      relations: ['empleado', 'empleado.persona', 'paciente', 'paciente.persona'],
      order: { hora: 'ASC' },
    });
  }

  async create(data: Partial<AgendaCitaEntity>): Promise<AgendaCitaEntity> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async update(idCita: number, data: Partial<AgendaCitaEntity>): Promise<AgendaCitaEntity> {
    await this.repository.update(idCita, data);
    return this.findById(idCita);
  }

  async delete(idCita: number): Promise<void> {
    await this.repository.delete(idCita);
  }

  async count(): Promise<number> {
    return this.repository.count();
  }

  async getNextId(): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('cita')
      .select('MAX(cita.idCita)', 'max')
      .getRawOne();

    return (result?.max || 0) + 1;
  }

  async findWithPagination(page: number, limit: number): Promise<[AgendaCitaEntity[], number]> {
    return this.repository.findAndCount({
      relations: ['empleado', 'empleado.persona', 'paciente', 'paciente.persona'],
      skip: (page - 1) * limit,
      take: limit,
      order: { fecha: 'DESC', hora: 'DESC' },
    });
  }
}
