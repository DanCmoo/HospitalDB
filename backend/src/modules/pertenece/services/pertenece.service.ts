import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PerteneceRepository } from '../repositories/pertenece.repository';
import { CreatePerteneceDto, PerteneceResponseDto } from '../dtos';
import { PerteneceEntity } from '../entities/pertenece.entity';

@Injectable()
export class PerteneceService {
  constructor(private readonly perteneceRepository: PerteneceRepository) {}

  async findAll(): Promise<PerteneceResponseDto[]> {
    const perteneces = await this.perteneceRepository.findAll();
    return perteneces.map(this.mapToResponse);
  }

  async findByDepartamento(nomDept: string): Promise<PerteneceResponseDto[]> {
    const perteneces = await this.perteneceRepository.findByDepartamento(nomDept);
    return perteneces.map(this.mapToResponse);
  }

  async findByEquipamiento(codEq: number): Promise<PerteneceResponseDto[]> {
    const perteneces = await this.perteneceRepository.findByEquipamiento(codEq);
    return perteneces.map(this.mapToResponse);
  }

  async findById(nomDept: string, codEq: number): Promise<PerteneceResponseDto> {
    const pertenece = await this.perteneceRepository.findById(nomDept, codEq);
    if (!pertenece) {
      throw new NotFoundException(
        `Relación entre departamento ${nomDept} y equipamiento ${codEq} no encontrada`,
      );
    }
    return this.mapToResponse(pertenece);
  }

  async create(createDto: CreatePerteneceDto): Promise<PerteneceResponseDto> {
    // Verificar si la relación ya existe
    const exists = await this.perteneceRepository.existsRelation(
      createDto.nomDept,
      createDto.codEq,
    );
    if (exists) {
      throw new ConflictException(
        `La relación entre departamento ${createDto.nomDept} y equipamiento ${createDto.codEq} ya existe`,
      );
    }

    const pertenece = await this.perteneceRepository.createPertenece(createDto);
    const created = await this.perteneceRepository.findById(
      pertenece.nomDept,
      pertenece.codEq,
    );
    return this.mapToResponse(created!);
  }

  async delete(nomDept: string, codEq: number): Promise<void> {
    const pertenece = await this.perteneceRepository.findById(nomDept, codEq);
    if (!pertenece) {
      throw new NotFoundException(
        `Relación entre departamento ${nomDept} y equipamiento ${codEq} no encontrada`,
      );
    }
    await this.perteneceRepository.deletePertenece(nomDept, codEq);
  }

  async getEquipamientoCount(nomDept: string): Promise<number> {
    return this.perteneceRepository.getEquipamientoCountByDepartamento(nomDept);
  }

  async getDepartamentosCount(codEq: number): Promise<number> {
    return this.perteneceRepository.getDepartamentosCountByEquipamiento(codEq);
  }

  private mapToResponse(pertenece: PerteneceEntity): PerteneceResponseDto {
    return {
      nomDept: pertenece.nomDept,
      codEq: pertenece.codEq,
      departamento: pertenece.departamento
        ? {
            nomDept: pertenece.departamento.nomDept,
            idSede: pertenece.departamento.idSede,
            sede: pertenece.departamento.sede,
          }
        : undefined,
      equipamiento: pertenece.equipamiento
        ? {
            codEq: pertenece.equipamiento.codEq,
            nomEq: pertenece.equipamiento.nomEq,
            estado: pertenece.equipamiento.estado,
            fechaMant: pertenece.equipamiento.fechaMant,
            idEmp: pertenece.equipamiento.idEmp,
            empleado: pertenece.equipamiento.empleado,
          }
        : undefined,
    };
  }
}
