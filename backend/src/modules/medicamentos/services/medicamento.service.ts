import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { MedicamentoRepository } from '../repositories/medicamento.repository';
import { CreateMedicamentoDto, UpdateMedicamentoDto, MedicamentoResponseDto, UpdateStockDto } from '../dtos';
import { MedicamentoEntity } from '../entities/medicamento.entity';

@Injectable()
export class MedicamentoService {
  constructor(
    private readonly medicamentoRepository: MedicamentoRepository,
  ) {}

  async create(createMedicamentoDto: CreateMedicamentoDto): Promise<MedicamentoResponseDto> {
    // Verificar que el código no exista
    const existingByCodigo = await this.medicamentoRepository.findByCodigo(
      createMedicamentoDto.codMed,
    );
    if (existingByCodigo) {
      throw new ConflictException(
        `Medicamento con código ${createMedicamentoDto.codMed} ya existe`,
      );
    }

    // Verificar que el nombre no exista
    const existingByNombre = await this.medicamentoRepository.findByNombre(
      createMedicamentoDto.nomMed,
    );
    if (existingByNombre) {
      throw new ConflictException(
        `Medicamento con nombre ${createMedicamentoDto.nomMed} ya existe`,
      );
    }

    const entity = await this.medicamentoRepository.create(createMedicamentoDto);
    return this.mapEntityToDto(entity);
  }

  async findAll(): Promise<MedicamentoResponseDto[]> {
    const entities = await this.medicamentoRepository.findAll();
    return entities.map((entity) => this.mapEntityToDto(entity));
  }

  async findByCodigo(codMed: number): Promise<MedicamentoResponseDto> {
    const entity = await this.medicamentoRepository.findByCodigo(codMed);
    if (!entity) {
      throw new NotFoundException(`Medicamento con código ${codMed} no encontrado`);
    }
    return this.mapEntityToDto(entity);
  }

  async findByProveedor(proveedor: string): Promise<MedicamentoResponseDto[]> {
    const entities = await this.medicamentoRepository.findByProveedor(proveedor);
    return entities.map((entity) => this.mapEntityToDto(entity));
  }

  async findByStockBajo(minimo: number = 10): Promise<MedicamentoResponseDto[]> {
    const entities = await this.medicamentoRepository.findByStockBajo(minimo);
    return entities.map((entity) => this.mapEntityToDto(entity));
  }

  async search(searchTerm: string): Promise<MedicamentoResponseDto[]> {
    const entities = await this.medicamentoRepository.search(searchTerm);
    return entities.map((entity) => this.mapEntityToDto(entity));
  }

  async update(
    codMed: number,
    updateMedicamentoDto: UpdateMedicamentoDto,
  ): Promise<MedicamentoResponseDto> {
    const existing = await this.medicamentoRepository.findByCodigo(codMed);
    if (!existing) {
      throw new NotFoundException(`Medicamento con código ${codMed} no encontrado`);
    }

    // Si se actualiza el nombre, verificar que no exista otro con ese nombre
    if (updateMedicamentoDto.nomMed && updateMedicamentoDto.nomMed !== existing.nomMed) {
      const existingByNombre = await this.medicamentoRepository.findByNombre(
        updateMedicamentoDto.nomMed,
      );
      if (existingByNombre) {
        throw new ConflictException(
          `Ya existe un medicamento con nombre ${updateMedicamentoDto.nomMed}`,
        );
      }
    }

    const updated = await this.medicamentoRepository.update(codMed, updateMedicamentoDto);
    return this.mapEntityToDto(updated);
  }

  async delete(codMed: number): Promise<void> {
    const existing = await this.medicamentoRepository.findByCodigo(codMed);
    if (!existing) {
      throw new NotFoundException(`Medicamento con código ${codMed} no encontrado`);
    }

    await this.medicamentoRepository.delete(codMed);
  }

  async count(): Promise<number> {
    return this.medicamentoRepository.count();
  }

  async getNextCodigo(): Promise<number> {
    return this.medicamentoRepository.getNextCodigo();
  }

  async findWithPagination(
    page: number,
    limit: number,
  ): Promise<{ data: MedicamentoResponseDto[]; total: number; page: number; limit: number }> {
    const [entities, total] = await this.medicamentoRepository.findWithPagination(page, limit);
    return {
      data: entities.map((entity) => this.mapEntityToDto(entity)),
      total,
      page,
      limit,
    };
  }

  async updateStock(codMed: number, updateStockDto: UpdateStockDto): Promise<MedicamentoResponseDto> {
    const existing = await this.medicamentoRepository.findByCodigo(codMed);
    if (!existing) {
      throw new NotFoundException(`Medicamento con código ${codMed} no encontrado`);
    }

    const newStock = existing.stock + updateStockDto.cantidad;
    if (newStock < 0) {
      throw new BadRequestException(
        `Stock insuficiente. Stock actual: ${existing.stock}, Cantidad solicitada: ${Math.abs(updateStockDto.cantidad)}`,
      );
    }

    const updated = await this.medicamentoRepository.updateStock(codMed, updateStockDto.cantidad);
    return this.mapEntityToDto(updated);
  }

  private mapEntityToDto(entity: MedicamentoEntity): MedicamentoResponseDto {
    return {
      codMed: entity.codMed,
      nomMed: entity.nomMed,
      stock: entity.stock,
      proveedor: entity.proveedor,
      descripcion: entity.descripcion,
    };
  }
}
