import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EquipamientoEntity } from '../entities/equipamiento.entity';

@Injectable()
export class EquipamientoRepository {
  constructor(
    @InjectRepository(EquipamientoEntity)
    private readonly repository: Repository<EquipamientoEntity>,
  ) {}

  async findAll(): Promise<EquipamientoEntity[]> {
    return this.repository.find({
      relations: ['empleado', 'empleado.persona', 'departamentos'],
    });
  }

  async findByCodigo(codEq: number, idSede: number): Promise<EquipamientoEntity | null> {
    return this.repository.findOne({
      where: { codEq, idSede },
      relations: ['empleado', 'empleado.persona', 'departamentos'],
    });
  }

  async findByEstado(estado: string): Promise<EquipamientoEntity[]> {
    return this.repository.find({
      where: { estado },
      relations: ['empleado', 'empleado.persona', 'departamentos'],
    });
  }

  async findByEmpleado(idEmp: number, idSede: number): Promise<EquipamientoEntity[]> {
    return this.repository.find({
      where: { idEmp, idSede },
      relations: ['empleado', 'empleado.persona', 'departamentos'],
    });
  }

  async findBySede(idSede: number): Promise<EquipamientoEntity[]> {
    return this.repository.find({
      where: { idSede },
      relations: ['empleado', 'empleado.persona', 'departamentos'],
    });
  }

  async findByDepartamento(nomDept: string): Promise<EquipamientoEntity[]> {
    return this.repository
      .createQueryBuilder('equipamiento')
      .innerJoinAndSelect('equipamiento.empleado', 'empleado')
      .leftJoinAndSelect('empleado.persona', 'persona')
      .innerJoinAndSelect('equipamiento.departamentos', 'departamento')
      .where('departamento.nomDept = :nomDept', { nomDept })
      .getMany();
  }

  async search(searchTerm: string): Promise<EquipamientoEntity[]> {
    return this.repository
      .createQueryBuilder('equipamiento')
      .leftJoinAndSelect('equipamiento.empleado', 'empleado')
      .leftJoinAndSelect('empleado.persona', 'persona')
      .leftJoinAndSelect('equipamiento.departamentos', 'departamentos')
      .where('LOWER(equipamiento.nomEq) LIKE LOWER(:searchTerm)', {
        searchTerm: `%${searchTerm}%`,
      })
      .orWhere('LOWER(equipamiento.estado) LIKE LOWER(:searchTerm)', {
        searchTerm: `%${searchTerm}%`,
      })
      .getMany();
  }

  async create(data: Partial<EquipamientoEntity>): Promise<EquipamientoEntity> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async update(codEq: number, idSede: number, data: Partial<EquipamientoEntity>): Promise<EquipamientoEntity> {
    await this.repository.update({ codEq, idSede }, data);
    return this.findByCodigo(codEq, idSede);
  }

  async delete(codEq: number, idSede: number): Promise<void> {
    await this.repository.delete({ codEq, idSede });
  }

  async count(): Promise<number> {
    return this.repository.count();
  }

  async getNextCodigo(): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('equipamiento')
      .select('MAX(equipamiento.codEq)', 'max')
      .getRawOne();

    return (result?.max || 0) + 1;
  }

  async findWithPagination(
    page: number,
    limit: number,
  ): Promise<[EquipamientoEntity[], number]> {
    return this.repository.findAndCount({
      relations: ['empleado', 'empleado.persona', 'departamentos'],
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async assignDepartamento(codEq: number, nomDept: string): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .relation(EquipamientoEntity, 'departamentos')
      .of(codEq)
      .add(nomDept);
  }

  async removeDepartamento(codEq: number, nomDept: string): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .relation(EquipamientoEntity, 'departamentos')
      .of(codEq)
      .remove(nomDept);
  }
}
