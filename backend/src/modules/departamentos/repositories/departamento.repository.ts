import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DepartamentoEntity } from '../entities/departamento.entity';

@Injectable()
export class DepartamentoRepository {
  constructor(
    @InjectRepository(DepartamentoEntity)
    private readonly repository: Repository<DepartamentoEntity>,
  ) {}

  async findAll(): Promise<DepartamentoEntity[]> {
    return this.repository.find({
      relations: ['sede'],
      order: { nomDept: 'ASC' },
    });
  }

  async findByNombre(nomDept: string, idSede: number): Promise<DepartamentoEntity | null> {
    return this.repository.findOne({
      where: { nomDept, idSede },
      relations: ['sede'],
    });
  }

  async findBySede(idSede: number): Promise<DepartamentoEntity[]> {
    return this.repository.find({
      where: { idSede },
      relations: ['sede'],
      order: { nomDept: 'ASC' },
    });
  }

  async search(searchTerm: string): Promise<DepartamentoEntity[]> {
    return this.repository
      .createQueryBuilder('departamento')
      .leftJoinAndSelect('departamento.sede', 'sede')
      .where('LOWER(departamento.nomDept) LIKE LOWER(:searchTerm)', {
        searchTerm: `%${searchTerm}%`,
      })
      .orderBy('departamento.nomDept', 'ASC')
      .getMany();
  }

  async create(data: Partial<DepartamentoEntity>): Promise<DepartamentoEntity> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async update(
    nomDept: string,
    idSede: number,
    data: Partial<DepartamentoEntity>,
  ): Promise<DepartamentoEntity | null> {
    await this.repository.update({ nomDept, idSede }, data);
    return this.findByNombre(nomDept, idSede);
  }

  async delete(nomDept: string, idSede: number): Promise<boolean> {
    const result = await this.repository.delete({ nomDept, idSede });
    return result.affected > 0;
  }

  async count(): Promise<number> {
    return this.repository.count();
  }

  async countBySede(idSede: number): Promise<number> {
    return this.repository.count({ where: { idSede } });
  }

  async findWithPagination(
    page: number,
    limit: number,
  ): Promise<[DepartamentoEntity[], number]> {
    return this.repository.findAndCount({
      relations: ['sede'],
      skip: (page - 1) * limit,
      take: limit,
      order: { nomDept: 'ASC' },
    });
  }
}
