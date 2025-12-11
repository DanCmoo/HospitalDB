import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmpleadoEntity } from '../entities/empleado.entity';

@Injectable()
export class EmpleadoRepository {
  constructor(
    @InjectRepository(EmpleadoEntity)
    private readonly repository: Repository<EmpleadoEntity>,
  ) {}

  async findById(idEmp: number): Promise<EmpleadoEntity | null> {
    return this.repository.findOne({
      where: { idEmp },
      relations: ['persona'],
    });
  }

  async findAll(): Promise<EmpleadoEntity[]> {
    return this.repository.find({
      relations: ['persona'],
      order: { idEmp: 'ASC' },
    });
  }

  async findWithPagination(
    page: number = 1,
    limit: number = 10,
  ): Promise<[EmpleadoEntity[], number]> {
    const skip = (page - 1) * limit;
    return this.repository.findAndCount({
      relations: ['persona'],
      skip,
      take: limit,
      order: { idEmp: 'ASC' },
    });
  }

  async findByNumDoc(numDoc: string): Promise<EmpleadoEntity[]> {
    return this.repository.find({
      where: { numDoc },
      relations: ['persona'],
    });
  }

  async findByCargo(cargo: string): Promise<EmpleadoEntity[]> {
    return this.repository.find({
      where: { cargo },
      relations: ['persona'],
    });
  }

  async findByDepartamento(nomDept: string): Promise<EmpleadoEntity[]> {
    return this.repository.find({
      where: { nomDept },
      relations: ['persona'],
    });
  }

  async create(data: Partial<EmpleadoEntity>): Promise<EmpleadoEntity> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async update(
    idEmp: number,
    data: Partial<EmpleadoEntity>,
  ): Promise<EmpleadoEntity | null> {
    await this.repository.update({ idEmp }, data);
    return this.findById(idEmp);
  }

  async delete(idEmp: number): Promise<boolean> {
    const result = await this.repository.delete({ idEmp });
    return result.affected > 0;
  }

  async count(): Promise<number> {
    return this.repository.count();
  }

  async getNextId(): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('empleado')
      .select('MAX(empleado.id_emp)', 'maxId')
      .getRawOne();

    return (result?.maxId || 0) + 1;
  }
}
