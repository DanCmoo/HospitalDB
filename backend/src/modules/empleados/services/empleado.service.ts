import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { EmpleadoRepository } from '../repositories/empleado.repository';
import { PersonaRepository } from '../../personas/repositories/persona.repository';
import {
  CreateEmpleadoDto,
  UpdateEmpleadoDto,
  EmpleadoResponseDto,
} from '../dtos';
import { EmpleadoEntity } from '../entities/empleado.entity';
import { PaginationResponseDto } from '../../../common/utils/pagination.interface';
import { SedeConfig } from '../../../config/sede.config';

@Injectable()
export class EmpleadoService {
  private readonly logger = new Logger(EmpleadoService.name);

  constructor(
    private readonly empleadoRepository: EmpleadoRepository,
    private readonly personaRepository: PersonaRepository,
  ) {}

  async create(createEmpleadoDto: CreateEmpleadoDto): Promise<EmpleadoResponseDto> {
    this.logger.log(`Creating empleado for numDoc: ${createEmpleadoDto.numDoc}`);

    // Verificar que la persona existe
    const persona = await this.personaRepository.findByNumDoc(
      createEmpleadoDto.numDoc,
    );
    if (!persona) {
      throw new NotFoundException(
        `Persona con documento ${createEmpleadoDto.numDoc} no encontrada`,
      );
    }

    // Generar el siguiente ID
    const idEmp = await this.empleadoRepository.getNextId();

    const entity = await this.empleadoRepository.create({
      idEmp,
      ...createEmpleadoDto,
    });

    this.logger.debug(`Empleado created successfully: ${entity.idEmp}`);
    return this.mapEntityToDto(entity);
  }

  async findAll(): Promise<EmpleadoResponseDto[]> {
    this.logger.log('Fetching all empleados');
    const entities = await this.empleadoRepository.findAll();
    return entities.map((entity) => this.mapEntityToDto(entity));
  }

  async findAllPaginated(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginationResponseDto<EmpleadoResponseDto>> {
    this.logger.log(`Fetching empleados - page: ${page}, limit: ${limit}`);

    if (page < 1) {
      throw new BadRequestException('El número de página debe ser mayor a 0');
    }
    if (limit < 1 || limit > 100) {
      throw new BadRequestException('El límite debe estar entre 1 y 100');
    }

    const [entities, total] = await this.empleadoRepository.findWithPagination(
      page,
      limit,
    );

    return {
      data: entities.map((entity) => this.mapEntityToDto(entity)),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findById(idEmp: number, idSede?: number): Promise<EmpleadoResponseDto> {
    this.logger.log(`Fetching empleado by id: ${idEmp}`);
    const sede = idSede || SedeConfig.getIdSede();
    const entity = await this.empleadoRepository.findById(idEmp, sede);

    if (!entity) {
      throw new NotFoundException(`Empleado con id ${idEmp} no encontrado`);
    }

    return this.mapEntityToDto(entity);
  }

  async findByCargo(cargo: string): Promise<EmpleadoResponseDto[]> {
    this.logger.log(`Fetching empleados by cargo: ${cargo}`);
    const entities = await this.empleadoRepository.findByCargo(cargo);
    return entities.map((entity) => this.mapEntityToDto(entity));
  }

  async findByDepartamento(nomDept: string): Promise<EmpleadoResponseDto[]> {
    this.logger.log(`Fetching empleados by departamento: ${nomDept}`);
    const entities = await this.empleadoRepository.findByDepartamento(nomDept);
    return entities.map((entity) => this.mapEntityToDto(entity));
  }

  async update(
    idEmp: number,
    updateEmpleadoDto: UpdateEmpleadoDto,
    idSede?: number,
  ): Promise<EmpleadoResponseDto> {
    this.logger.log(`Updating empleado with id: ${idEmp}`);

    const sede = idSede || SedeConfig.getIdSede();
    const existing = await this.empleadoRepository.findById(idEmp, sede);
    if (!existing) {
      throw new NotFoundException(`Empleado con id ${idEmp} no encontrado`);
    }

    const updated = await this.empleadoRepository.update(idEmp, sede, updateEmpleadoDto);
    this.logger.debug(`Empleado updated successfully: ${idEmp}`);
    return this.mapEntityToDto(updated);
  }

  async delete(idEmp: number, idSede?: number): Promise<void> {
    this.logger.log(`Deleting empleado with id: ${idEmp}`);

    const sede = idSede || SedeConfig.getIdSede();
    const existing = await this.empleadoRepository.findById(idEmp, sede);
    if (!existing) {
      throw new NotFoundException(`Empleado con id ${idEmp} no encontrado`);
    }

    const deleted = await this.empleadoRepository.delete(idEmp, sede);
    if (!deleted) {
      throw new BadRequestException('No se pudo eliminar el empleado');
    }

    this.logger.debug(`Empleado deleted successfully: ${idEmp}`);
  }

  async count(): Promise<number> {
    return this.empleadoRepository.count();
  }

  private mapEntityToDto(entity: EmpleadoEntity): EmpleadoResponseDto {
    return {
      idEmp: entity.idEmp,
      numDoc: entity.numDoc,
      hashContrato: entity.hashContrato,
      idSede: entity.idSede,
      nomDept: entity.nomDept,
      cargo: entity.cargo,
      persona: entity.persona
        ? {
            numDoc: entity.persona.numDoc,
            tipoDoc: entity.persona.tipoDoc,
            nomPers: entity.persona.nomPers,
            correo: entity.persona.correo,
            telPers: entity.persona.telPers,
          }
        : undefined,
    };
  }
}
