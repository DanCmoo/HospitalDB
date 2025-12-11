import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PersonaEntity } from '../entities/persona.entity';

@Injectable()
export class PersonaRepository {
  constructor(
    @InjectRepository(PersonaEntity)
    private readonly repository: Repository<PersonaEntity>,
  ) {}

  async findByNumDoc(numDoc: string): Promise<PersonaEntity | null> {
    return this.repository.findOne({ where: { numDoc } });
  }

  async findAll(): Promise<PersonaEntity[]> {
    return this.repository.find({
      order: { nomPers: 'ASC' },
    });
  }

  async findWithPagination(
    page: number = 1,
    limit: number = 10,
  ): Promise<[PersonaEntity[], number]> {
    const skip = (page - 1) * limit;
    return this.repository.findAndCount({
      skip,
      take: limit,
      order: { nomPers: 'ASC' },
    });
  }

  async create(data: Partial<PersonaEntity>): Promise<PersonaEntity> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async update(
    numDoc: string,
    data: Partial<PersonaEntity>,
  ): Promise<PersonaEntity | null> {
    await this.repository.update({ numDoc }, data);
    return this.findByNumDoc(numDoc);
  }

  async delete(numDoc: string): Promise<boolean> {
    const result = await this.repository.delete({ numDoc });
    return result.affected > 0;
  }

  async count(): Promise<number> {
    return this.repository.count();
  }

  async searchByName(nombre: string): Promise<PersonaEntity[]> {
    return this.repository
      .createQueryBuilder('persona')
      .where('persona.nom_pers ILIKE :nombre', { nombre: `%${nombre}%` })
      .orderBy('persona.nom_pers', 'ASC')
      .getMany();
  }

  async findByEmail(correo: string): Promise<PersonaEntity | null> {
    return this.repository.findOne({ where: { correo } });
  }
}
