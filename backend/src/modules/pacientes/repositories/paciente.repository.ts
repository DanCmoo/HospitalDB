import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PacienteEntity } from '../entities/paciente.entity';

@Injectable()
export class PacienteRepository {
  constructor(
    @InjectRepository(PacienteEntity)
    private readonly repository: Repository<PacienteEntity>,
  ) {}

  async findAll(): Promise<PacienteEntity[]> {
    return this.repository.find({
      relations: ['persona'],
      order: { codPac: 'ASC' },
    });
  }

  async findByCodigo(codPac: number, idSede: number): Promise<PacienteEntity | null> {
    return this.repository.findOne({
      where: { codPac, idSede },
      relations: ['persona'],
    });
  }

  async findByNumDoc(numDoc: string): Promise<PacienteEntity | null> {
    return this.repository.findOne({
      where: { numDoc },
      relations: ['persona'],
    });
  }

  async findByGenero(genero: string): Promise<PacienteEntity[]> {
    return this.repository.find({
      where: { genero },
      relations: ['persona'],
      order: { codPac: 'ASC' },
    });
  }

  async findBySede(idSede: number): Promise<PacienteEntity[]> {
    return this.repository.find({
      where: { idSede },
      relations: ['persona'],
      order: { codPac: 'ASC' },
    });
  }

  async search(searchTerm: string): Promise<PacienteEntity[]> {
    return this.repository
      .createQueryBuilder('paciente')
      .leftJoinAndSelect('paciente.persona', 'persona')
      .where('LOWER(persona.nomPers) LIKE LOWER(:searchTerm)', {
        searchTerm: `%${searchTerm}%`,
      })
      .orWhere('paciente.numDoc LIKE :searchTerm', {
        searchTerm: `%${searchTerm}%`,
      })
      .orderBy('paciente.codPac', 'ASC')
      .getMany();
  }

  async create(data: Partial<PacienteEntity>): Promise<PacienteEntity> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async update(codPac: number, idSede: number, data: Partial<PacienteEntity>): Promise<PacienteEntity | null> {
    await this.repository.update({ codPac, idSede }, data);
    return this.findByCodigo(codPac, idSede);
  }

  async delete(codPac: number, idSede: number): Promise<boolean> {
    const result = await this.repository.delete({ codPac, idSede });
    return result.affected > 0;
  }

  async count(): Promise<number> {
    return this.repository.count();
  }

  async getNextCodigo(): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('paciente')
      .select('MAX(paciente.codPac)', 'maxCod')
      .getRawOne();
    return (result?.maxCod || 0) + 1;
  }

  async findWithPagination(page: number, limit: number): Promise<[PacienteEntity[], number]> {
    return this.repository.findAndCount({
      relations: ['persona'],
      skip: (page - 1) * limit,
      take: limit,
      order: { codPac: 'ASC' },
    });
  }
}
