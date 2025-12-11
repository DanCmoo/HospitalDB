import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SedeEntity } from '../entities/sede.entity';

@Injectable()
export class SedeRepository {
  constructor(
    @InjectRepository(SedeEntity)
    private readonly repository: Repository<SedeEntity>,
  ) {}

  async findAll(): Promise<SedeEntity[]> {
    return this.repository.find({
      relations: ['departamentos'],
      order: { idSede: 'ASC' },
    });
  }

  async findById(idSede: number): Promise<SedeEntity | null> {
    return this.repository.findOne({
      where: { idSede },
      relations: ['departamentos'],
    });
  }

  async findByCiudad(ciudad: string): Promise<SedeEntity[]> {
    return this.repository.find({
      where: { ciudad },
      relations: ['departamentos'],
      order: { idSede: 'ASC' },
    });
  }

  async search(searchTerm: string): Promise<SedeEntity[]> {
    return this.repository
      .createQueryBuilder('sede')
      .leftJoinAndSelect('sede.departamentos', 'departamento')
      .where('LOWER(sede.nomSede) LIKE LOWER(:searchTerm)', {
        searchTerm: `%${searchTerm}%`,
      })
      .orWhere('LOWER(sede.ciudad) LIKE LOWER(:searchTerm)', {
        searchTerm: `%${searchTerm}%`,
      })
      .orderBy('sede.idSede', 'ASC')
      .getMany();
  }

  async create(data: Partial<SedeEntity>): Promise<SedeEntity> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async update(idSede: number, data: Partial<SedeEntity>): Promise<SedeEntity | null> {
    await this.repository.update(idSede, data);
    return this.findById(idSede);
  }

  async delete(idSede: number): Promise<boolean> {
    const result = await this.repository.delete(idSede);
    return result.affected > 0;
  }

  async count(): Promise<number> {
    return this.repository.count();
  }

  async getNextId(): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('sede')
      .select('MAX(sede.idSede)', 'maxId')
      .getRawOne();
    return (result?.maxId || 0) + 1;
  }

  async findWithPagination(page: number, limit: number): Promise<[SedeEntity[], number]> {
    return this.repository.findAndCount({
      relations: ['departamentos'],
      skip: (page - 1) * limit,
      take: limit,
      order: { idSede: 'ASC' },
    });
  }
}
