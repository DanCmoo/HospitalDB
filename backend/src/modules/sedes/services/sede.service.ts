import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { SedeRepository } from '../repositories/sede.repository';
import { CreateSedeDto, UpdateSedeDto, SedeResponseDto } from '../dtos';
import { SedeEntity } from '../entities/sede.entity';

@Injectable()
export class SedeService {
  constructor(private readonly sedeRepository: SedeRepository) {}

  async create(createSedeDto: CreateSedeDto): Promise<SedeResponseDto> {
    const existing = await this.sedeRepository.findById(createSedeDto.idSede);
    if (existing) {
      throw new ConflictException(
        `Sede con ID ${createSedeDto.idSede} ya existe`,
      );
    }

    const entity = await this.sedeRepository.create(createSedeDto);
    return this.mapEntityToDto(entity);
  }

  async findAll(): Promise<SedeResponseDto[]> {
    const entities = await this.sedeRepository.findAll();
    return entities.map((entity) => this.mapEntityToDto(entity));
  }

  async findById(idSede: number): Promise<SedeResponseDto> {
    const entity = await this.sedeRepository.findById(idSede);
    if (!entity) {
      throw new NotFoundException(`Sede con ID ${idSede} no encontrada`);
    }
    return this.mapEntityToDto(entity);
  }

  async findByCiudad(ciudad: string): Promise<SedeResponseDto[]> {
    const entities = await this.sedeRepository.findByCiudad(ciudad);
    return entities.map((entity) => this.mapEntityToDto(entity));
  }

  async search(searchTerm: string): Promise<SedeResponseDto[]> {
    const entities = await this.sedeRepository.search(searchTerm);
    return entities.map((entity) => this.mapEntityToDto(entity));
  }

  async update(idSede: number, updateSedeDto: UpdateSedeDto): Promise<SedeResponseDto> {
    const existing = await this.sedeRepository.findById(idSede);
    if (!existing) {
      throw new NotFoundException(`Sede con ID ${idSede} no encontrada`);
    }

    const updated = await this.sedeRepository.update(idSede, updateSedeDto);
    return this.mapEntityToDto(updated);
  }

  async delete(idSede: number): Promise<void> {
    const existing = await this.sedeRepository.findById(idSede);
    if (!existing) {
      throw new NotFoundException(`Sede con ID ${idSede} no encontrada`);
    }

    // Verificar si tiene departamentos asociados
    if (existing.departamentos && existing.departamentos.length > 0) {
      throw new ConflictException(
        `No se puede eliminar la sede porque tiene ${existing.departamentos.length} departamento(s) asociado(s)`,
      );
    }

    await this.sedeRepository.delete(idSede);
  }

  async count(): Promise<number> {
    return this.sedeRepository.count();
  }

  async getNextId(): Promise<number> {
    return this.sedeRepository.getNextId();
  }

  async findWithPagination(
    page: number,
    limit: number,
  ): Promise<{ data: SedeResponseDto[]; total: number; page: number; limit: number }> {
    const [entities, total] = await this.sedeRepository.findWithPagination(page, limit);
    return {
      data: entities.map((entity) => this.mapEntityToDto(entity)),
      total,
      page,
      limit,
    };
  }

  private mapEntityToDto(entity: SedeEntity): SedeResponseDto {
    return {
      idSede: entity.idSede,
      telefono: entity.telefono,
      direccion: entity.direccion,
      nomSede: entity.nomSede,
      ciudad: entity.ciudad,
      departamentos: entity.departamentos?.map((dept) => ({
        nomDept: dept.nomDept,
        idSede: dept.idSede,
      })),
    };
  }
}
