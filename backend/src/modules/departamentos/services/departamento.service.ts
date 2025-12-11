import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { DepartamentoRepository } from '../repositories/departamento.repository';
import { SedeRepository } from '../../sedes/repositories/sede.repository';
import { CreateDepartamentoDto, UpdateDepartamentoDto, DepartamentoResponseDto } from '../dtos';
import { DepartamentoEntity } from '../entities/departamento.entity';

@Injectable()
export class DepartamentoService {
  constructor(
    private readonly departamentoRepository: DepartamentoRepository,
    private readonly sedeRepository: SedeRepository,
  ) {}

  async create(createDepartamentoDto: CreateDepartamentoDto): Promise<DepartamentoResponseDto> {
    // Verificar que no exista un departamento con el mismo nombre
    const existing = await this.departamentoRepository.findByNombre(
      createDepartamentoDto.nomDept,
    );
    if (existing) {
      throw new ConflictException(
        `Departamento "${createDepartamentoDto.nomDept}" ya existe`,
      );
    }

    // Verificar que la sede exista
    const sede = await this.sedeRepository.findById(createDepartamentoDto.idSede);
    if (!sede) {
      throw new NotFoundException(
        `Sede con ID ${createDepartamentoDto.idSede} no encontrada`,
      );
    }

    const entity = await this.departamentoRepository.create(createDepartamentoDto);
    return this.mapEntityToDto(entity);
  }

  async findAll(): Promise<DepartamentoResponseDto[]> {
    const entities = await this.departamentoRepository.findAll();
    return entities.map((entity) => this.mapEntityToDto(entity));
  }

  async findByNombre(nomDept: string): Promise<DepartamentoResponseDto> {
    const entity = await this.departamentoRepository.findByNombre(nomDept);
    if (!entity) {
      throw new NotFoundException(`Departamento "${nomDept}" no encontrado`);
    }
    return this.mapEntityToDto(entity);
  }

  async findBySede(idSede: number): Promise<DepartamentoResponseDto[]> {
    const entities = await this.departamentoRepository.findBySede(idSede);
    return entities.map((entity) => this.mapEntityToDto(entity));
  }

  async search(searchTerm: string): Promise<DepartamentoResponseDto[]> {
    const entities = await this.departamentoRepository.search(searchTerm);
    return entities.map((entity) => this.mapEntityToDto(entity));
  }

  async update(
    nomDept: string,
    updateDepartamentoDto: UpdateDepartamentoDto,
  ): Promise<DepartamentoResponseDto> {
    const existing = await this.departamentoRepository.findByNombre(nomDept);
    if (!existing) {
      throw new NotFoundException(`Departamento "${nomDept}" no encontrado`);
    }

    // Si se está actualizando la sede, verificar que exista
    if (updateDepartamentoDto.idSede) {
      const sede = await this.sedeRepository.findById(updateDepartamentoDto.idSede);
      if (!sede) {
        throw new NotFoundException(
          `Sede con ID ${updateDepartamentoDto.idSede} no encontrada`,
        );
      }
    }

    const updated = await this.departamentoRepository.update(nomDept, updateDepartamentoDto);
    return this.mapEntityToDto(updated);
  }

  async delete(nomDept: string): Promise<void> {
    const existing = await this.departamentoRepository.findByNombre(nomDept);
    if (!existing) {
      throw new NotFoundException(`Departamento "${nomDept}" no encontrado`);
    }

    await this.departamentoRepository.delete(nomDept);
  }

  async count(): Promise<number> {
    return this.departamentoRepository.count();
  }

  async countBySede(idSede: number): Promise<number> {
    return this.departamentoRepository.countBySede(idSede);
  }

  async findWithPagination(
    page: number,
    limit: number,
  ): Promise<{ data: DepartamentoResponseDto[]; total: number; page: number; limit: number }> {
    const [entities, total] = await this.departamentoRepository.findWithPagination(page, limit);
    return {
      data: entities.map((entity) => this.mapEntityToDto(entity)),
      total,
      page,
      limit,
    };
  }

  private mapEntityToDto(entity: DepartamentoEntity): DepartamentoResponseDto {
    return {
      nomDept: entity.nomDept,
      idSede: entity.idSede,
      sede: entity.sede
        ? {
            idSede: entity.sede.idSede,
            nomSede: entity.sede.nomSede,
            ciudad: entity.sede.ciudad,
            direccion: entity.sede.direccion,
            telefono: entity.sede.telefono,
          }
        : undefined,
    };
  }
}
