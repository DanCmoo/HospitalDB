import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { AuditoriaEntity } from '../entities/auditoria.entity';

@Injectable()
export class AuditoriaRepository {
  constructor(
    @InjectRepository(AuditoriaEntity)
    private readonly repository: Repository<AuditoriaEntity>,
  ) {}

  async findAll(): Promise<AuditoriaEntity[]> {
    return this.repository.find({
      relations: ['persona'],
      order: { fechaEvento: 'DESC', idEvento: 'DESC' },
    });
  }

  async findById(idEvento: number): Promise<AuditoriaEntity | null> {
    return this.repository.findOne({
      where: { idEvento },
      relations: ['persona'],
    });
  }

  async findByPersona(numDoc: string): Promise<AuditoriaEntity[]> {
    return this.repository.find({
      where: { numDoc },
      relations: ['persona'],
      order: { fechaEvento: 'DESC', idEvento: 'DESC' },
    });
  }

  async findByAccion(accion: string): Promise<AuditoriaEntity[]> {
    return this.repository.find({
      where: { accion },
      relations: ['persona'],
      order: { fechaEvento: 'DESC', idEvento: 'DESC' },
    });
  }

  async findByTabla(tablaAfectada: string): Promise<AuditoriaEntity[]> {
    return this.repository.find({
      where: { tablaAfectada },
      relations: ['persona'],
      order: { fechaEvento: 'DESC', idEvento: 'DESC' },
    });
  }

  async findByFecha(fechaEvento: Date): Promise<AuditoriaEntity[]> {
    return this.repository.find({
      where: { fechaEvento },
      relations: ['persona'],
      order: { idEvento: 'DESC' },
    });
  }

  async findByFechaRango(fechaInicio: Date, fechaFin: Date): Promise<AuditoriaEntity[]> {
    return this.repository.find({
      where: {
        fechaEvento: Between(fechaInicio, fechaFin),
      },
      relations: ['persona'],
      order: { fechaEvento: 'DESC', idEvento: 'DESC' },
    });
  }

  async create(data: Partial<AuditoriaEntity>): Promise<AuditoriaEntity> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async delete(idEvento: number): Promise<void> {
    await this.repository.delete(idEvento);
  }

  async count(): Promise<number> {
    return this.repository.count();
  }

  async getNextId(): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('aud')
      .select('MAX(aud.idEvento)', 'max')
      .getRawOne();

    return (result?.max || 0) + 1;
  }

  async findWithPagination(page: number, limit: number): Promise<[AuditoriaEntity[], number]> {
    return this.repository.findAndCount({
      relations: ['persona'],
      skip: (page - 1) * limit,
      take: limit,
      order: { fechaEvento: 'DESC', idEvento: 'DESC' },
    });
  }
}
