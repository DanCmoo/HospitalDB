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

  async findById(idCita: number, idSede: number): Promise<AgendaCitaEntity | null> {
    return this.repository.findOne({
      where: { idCita, idSede },
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

  async findByEmpleado(idEmp: number, idSede: number): Promise<AgendaCitaEntity[]> {
    return this.repository.find({
      where: { idEmp, idSede },
      relations: ['empleado', 'empleado.persona', 'paciente', 'paciente.persona'],
      order: { fecha: 'DESC', hora: 'DESC' },
    });
  }

  async findByPaciente(codPac: number, idSede: number): Promise<AgendaCitaEntity[]> {
    return this.repository.find({
      where: { codPac, idSede },
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

  async update(idCita: number, idSede: number, data: Partial<AgendaCitaEntity>): Promise<AgendaCitaEntity> {
    await this.repository.update({ idCita, idSede }, data);
    return this.findById(idCita, idSede);
  }

  async delete(idCita: number, idSede: number): Promise<void> {
    await this.repository.delete({ idCita, idSede });
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
