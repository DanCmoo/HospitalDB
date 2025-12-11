import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { EquipamientoRepository } from '../repositories/equipamiento.repository';
import { EmpleadoRepository } from '../../empleados/repositories/empleado.repository';
import { DepartamentoRepository } from '../../departamentos/repositories/departamento.repository';
import { CreateEquipamientoDto, UpdateEquipamientoDto, EquipamientoResponseDto } from '../dtos';
import { EquipamientoEntity } from '../entities/equipamiento.entity';
import { SedeConfig } from '../../../config/sede.config';

@Injectable()
export class EquipamientoService {
  constructor(
    private readonly equipamientoRepository: EquipamientoRepository,
    private readonly empleadoRepository: EmpleadoRepository,
    private readonly departamentoRepository: DepartamentoRepository,
  ) {}

  async create(createEquipamientoDto: CreateEquipamientoDto): Promise<EquipamientoResponseDto> {
    // Verificar que el código no exista
    const existingByCodigo = await this.equipamientoRepository.findByCodigo(
      createEquipamientoDto.codEq,
    );
    if (existingByCodigo) {
      throw new ConflictException(
        `Equipamiento con código ${createEquipamientoDto.codEq} ya existe`,
      );
    }

    // Verificar que el empleado exista
    const empleado = await this.empleadoRepository.findById(createEquipamientoDto.idEmp);
    if (!empleado) {
      throw new NotFoundException(
        `Empleado con ID ${createEquipamientoDto.idEmp} no encontrado`,
      );
    }

    // Verificar departamentos si se proporcionan
    if (createEquipamientoDto.departamentos && createEquipamientoDto.departamentos.length > 0) {
      for (const nomDept of createEquipamientoDto.departamentos) {
        const dept = await this.departamentoRepository.findByNombre(nomDept);
        if (!dept) {
          throw new NotFoundException(`Departamento ${nomDept} no encontrado`);
        }
      }
    }

    const { departamentos, ...equipamientoData } = createEquipamientoDto;

    // Auto-asignar id_sede
    const idSede = SedeConfig.getIdSede();

    const equipamientoToCreate: any = {
      ...equipamientoData,
      idSede,
    };

    if (createEquipamientoDto.fechaMant) {
      equipamientoToCreate.fechaMant = new Date(createEquipamientoDto.fechaMant);
    }

    const entity = await this.equipamientoRepository.create(equipamientoToCreate);

    // Asignar departamentos si se proporcionan
    if (departamentos && departamentos.length > 0) {
      for (const nomDept of departamentos) {
        await this.equipamientoRepository.assignDepartamento(entity.codEq, nomDept);
      }
    }

    const created = await this.equipamientoRepository.findByCodigo(entity.codEq);
    return this.mapEntityToDto(created);
  }

  async findAll(): Promise<EquipamientoResponseDto[]> {
    const entities = await this.equipamientoRepository.findAll();
    return entities.map((entity) => this.mapEntityToDto(entity));
  }

  async findByCodigo(codEq: number): Promise<EquipamientoResponseDto> {
    const entity = await this.equipamientoRepository.findByCodigo(codEq);
    if (!entity) {
      throw new NotFoundException(`Equipamiento con código ${codEq} no encontrado`);
    }
    return this.mapEntityToDto(entity);
  }

  async findByEstado(estado: string): Promise<EquipamientoResponseDto[]> {
    const entities = await this.equipamientoRepository.findByEstado(estado);
    return entities.map((entity) => this.mapEntityToDto(entity));
  }

  async findByEmpleado(idEmp: number): Promise<EquipamientoResponseDto[]> {
    const entities = await this.equipamientoRepository.findByEmpleado(idEmp);
    return entities.map((entity) => this.mapEntityToDto(entity));
  }

  async findByDepartamento(nomDept: string): Promise<EquipamientoResponseDto[]> {
    const entities = await this.equipamientoRepository.findByDepartamento(nomDept);
    return entities.map((entity) => this.mapEntityToDto(entity));
  }

  async search(searchTerm: string): Promise<EquipamientoResponseDto[]> {
    const entities = await this.equipamientoRepository.search(searchTerm);
    return entities.map((entity) => this.mapEntityToDto(entity));
  }

  async update(
    codEq: number,
    updateEquipamientoDto: UpdateEquipamientoDto,
  ): Promise<EquipamientoResponseDto> {
    const existing = await this.equipamientoRepository.findByCodigo(codEq);
    if (!existing) {
      throw new NotFoundException(`Equipamiento con código ${codEq} no encontrado`);
    }

    const { departamentos, ...updateData } = updateEquipamientoDto;

    const dataToUpdate: any = { ...updateData };
    if (updateEquipamientoDto.fechaMant) {
      dataToUpdate.fechaMant = new Date(updateEquipamientoDto.fechaMant);
    }

    await this.equipamientoRepository.update(codEq, dataToUpdate);

    // Actualizar departamentos si se proporcionan
    if (departamentos !== undefined) {
      // Remover departamentos actuales
      if (existing.departamentos) {
        for (const dept of existing.departamentos) {
          await this.equipamientoRepository.removeDepartamento(codEq, dept.nomDept);
        }
      }

      // Asignar nuevos departamentos
      if (departamentos.length > 0) {
        for (const nomDept of departamentos) {
          const dept = await this.departamentoRepository.findByNombre(nomDept);
          if (!dept) {
            throw new NotFoundException(`Departamento ${nomDept} no encontrado`);
          }
          await this.equipamientoRepository.assignDepartamento(codEq, nomDept);
        }
      }
    }

    const updated = await this.equipamientoRepository.findByCodigo(codEq);
    return this.mapEntityToDto(updated);
  }

  async delete(codEq: number): Promise<void> {
    const existing = await this.equipamientoRepository.findByCodigo(codEq);
    if (!existing) {
      throw new NotFoundException(`Equipamiento con código ${codEq} no encontrado`);
    }

    await this.equipamientoRepository.delete(codEq);
  }

  async count(): Promise<number> {
    return this.equipamientoRepository.count();
  }

  async getNextCodigo(): Promise<number> {
    return this.equipamientoRepository.getNextCodigo();
  }

  async findWithPagination(
    page: number,
    limit: number,
  ): Promise<{ data: EquipamientoResponseDto[]; total: number; page: number; limit: number }> {
    const [entities, total] = await this.equipamientoRepository.findWithPagination(page, limit);
    return {
      data: entities.map((entity) => this.mapEntityToDto(entity)),
      total,
      page,
      limit,
    };
  }

  private mapEntityToDto(entity: EquipamientoEntity): EquipamientoResponseDto {
    return {
      codEq: entity.codEq,
      nomEq: entity.nomEq,
      estado: entity.estado,
      fechaMant: entity.fechaMant ? entity.fechaMant.toISOString().split('T')[0] : undefined,
      idEmp: entity.idEmp,
      empleado: entity.empleado
        ? {
            idEmp: entity.empleado.idEmp,
            numDoc: entity.empleado.numDoc,
            cargo: entity.empleado.cargo,
            persona: entity.empleado.persona
              ? {
                  numDoc: entity.empleado.persona.numDoc,
                  nomPers: entity.empleado.persona.nomPers,
                  correo: entity.empleado.persona.correo,
                  telPers: entity.empleado.persona.telPers,
                }
              : undefined,
          }
        : undefined,
      departamentos: entity.departamentos
        ? entity.departamentos.map((dept) => ({
            nomDept: dept.nomDept,
            idSede: dept.idSede,
          }))
        : undefined,
    };
  }
}
