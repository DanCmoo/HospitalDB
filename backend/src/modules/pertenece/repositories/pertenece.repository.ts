import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { PerteneceEntity } from '../entities/pertenece.entity';

@Injectable()
export class PerteneceRepository extends Repository<PerteneceEntity> {
  constructor(private dataSource: DataSource) {
    super(PerteneceEntity, dataSource.createEntityManager());
  }

  async findAll(): Promise<PerteneceEntity[]> {
    return this.find({
      relations: ['departamento', 'equipamiento', 'equipamiento.empleado', 'equipamiento.empleado.persona'],
    });
  }

  async findByDepartamento(nomDept: string): Promise<PerteneceEntity[]> {
    return this.find({
      where: { nomDept },
      relations: ['departamento', 'equipamiento', 'equipamiento.empleado', 'equipamiento.empleado.persona'],
    });
  }

  async findByEquipamiento(codEq: number): Promise<PerteneceEntity[]> {
    return this.find({
      where: { codEq },
      relations: ['departamento', 'equipamiento', 'equipamiento.empleado', 'equipamiento.empleado.persona'],
    });
  }

  async findById(nomDept: string, codEq: number): Promise<PerteneceEntity | null> {
    return this.findOne({
      where: { nomDept, codEq },
      relations: ['departamento', 'equipamiento', 'equipamiento.empleado', 'equipamiento.empleado.persona'],
    });
  }

  async createPertenece(pertenece: Partial<PerteneceEntity>): Promise<PerteneceEntity> {
    const newPertenece = this.create(pertenece);
    return this.save(newPertenece);
  }

  async deletePertenece(nomDept: string, codEq: number): Promise<void> {
    await this.delete({ nomDept, codEq });
  }

  async existsRelation(nomDept: string, codEq: number): Promise<boolean> {
    const count = await this.count({
      where: { nomDept, codEq },
    });
    return count > 0;
  }

  async getEquipamientoCountByDepartamento(nomDept: string): Promise<number> {
    return this.count({
      where: { nomDept },
    });
  }

  async getDepartamentosCountByEquipamiento(codEq: number): Promise<number> {
    return this.count({
      where: { codEq },
    });
  }
}
