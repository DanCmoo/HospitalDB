import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PersonaRepository } from '../repositories/persona.repository';
import {
  CreatePersonaDto,
  UpdatePersonaDto,
  PersonaResponseDto,
} from '../dtos';
import { PersonaEntity } from '../entities/persona.entity';
import { PaginationResponseDto } from '../../../common/utils/pagination.interface';
import { SedeConfig } from '../../../config/sede.config';

@Injectable()
export class PersonaService {
  private readonly logger = new Logger(PersonaService.name);

  constructor(private readonly personaRepository: PersonaRepository) {}

  async create(createPersonaDto: CreatePersonaDto): Promise<PersonaResponseDto> {
    this.logger.log(`Creating persona with numDoc: ${createPersonaDto.numDoc}`);

    // Verificar si ya existe
    const existing = await this.personaRepository.findByNumDoc(
      createPersonaDto.numDoc,
    );
    if (existing) {
      throw new ConflictException(
        `Persona con documento ${createPersonaDto.numDoc} ya existe`,
      );
    }

    // Verificar email único si se proporciona
    if (createPersonaDto.correo) {
      const existingEmail = await this.personaRepository.findByEmail(
        createPersonaDto.correo,
      );
      if (existingEmail) {
        throw new ConflictException(
          `El correo ${createPersonaDto.correo} ya está registrado`,
        );
      }
    }

    // Auto-asignar id_sede
    const idSede = SedeConfig.getIdSede();
    
    const entity = await this.personaRepository.create({
      ...createPersonaDto,
      idSedeRegistro: idSede,
    });
    this.logger.debug(`Persona created successfully: ${entity.numDoc} in sede ${idSede}`);
    return this.mapEntityToDto(entity);
  }

  async findAll(): Promise<PersonaResponseDto[]> {
    this.logger.log('Fetching all personas');
    const entities = await this.personaRepository.findAll();
    return entities.map((entity) => this.mapEntityToDto(entity));
  }

  async findAllPaginated(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginationResponseDto<PersonaResponseDto>> {
    this.logger.log(`Fetching personas - page: ${page}, limit: ${limit}`);

    if (page < 1) {
      throw new BadRequestException('El número de página debe ser mayor a 0');
    }
    if (limit < 1 || limit > 100) {
      throw new BadRequestException('El límite debe estar entre 1 y 100');
    }

    const [entities, total] = await this.personaRepository.findWithPagination(
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

  async findByNumDoc(numDoc: string): Promise<PersonaResponseDto> {
    this.logger.log(`Fetching persona by numDoc: ${numDoc}`);
    const entity = await this.personaRepository.findByNumDoc(numDoc);

    if (!entity) {
      throw new NotFoundException(
        `Persona con documento ${numDoc} no encontrada`,
      );
    }

    return this.mapEntityToDto(entity);
  }

  async searchByName(nombre: string): Promise<PersonaResponseDto[]> {
    this.logger.log(`Searching personas by name: ${nombre}`);

    if (!nombre || nombre.trim().length < 3) {
      throw new BadRequestException(
        'El nombre debe tener al menos 3 caracteres',
      );
    }

    const entities = await this.personaRepository.searchByName(nombre);
    return entities.map((entity) => this.mapEntityToDto(entity));
  }

  async update(
    numDoc: string,
    updatePersonaDto: UpdatePersonaDto,
  ): Promise<PersonaResponseDto> {
    this.logger.log(`Updating persona with numDoc: ${numDoc}`);

    const existing = await this.personaRepository.findByNumDoc(numDoc);
    if (!existing) {
      throw new NotFoundException(
        `Persona con documento ${numDoc} no encontrada`,
      );
    }

    // Verificar email único si se está actualizando
    if (updatePersonaDto.correo && updatePersonaDto.correo !== existing.correo) {
      const existingEmail = await this.personaRepository.findByEmail(
        updatePersonaDto.correo,
      );
      if (existingEmail && existingEmail.numDoc !== numDoc) {
        throw new ConflictException(
          `El correo ${updatePersonaDto.correo} ya está registrado`,
        );
      }
    }

    const updated = await this.personaRepository.update(numDoc, updatePersonaDto);
    this.logger.debug(`Persona updated successfully: ${numDoc}`);
    return this.mapEntityToDto(updated);
  }

  async delete(numDoc: string): Promise<void> {
    this.logger.log(`Deleting persona with numDoc: ${numDoc}`);

    const existing = await this.personaRepository.findByNumDoc(numDoc);
    if (!existing) {
      throw new NotFoundException(
        `Persona con documento ${numDoc} no encontrada`,
      );
    }

    const deleted = await this.personaRepository.delete(numDoc);
    if (!deleted) {
      throw new BadRequestException('No se pudo eliminar la persona');
    }

    this.logger.debug(`Persona deleted successfully: ${numDoc}`);
  }

  async count(): Promise<number> {
    return this.personaRepository.count();
  }

  private mapEntityToDto(entity: PersonaEntity): PersonaResponseDto {
    return {
      numDoc: entity.numDoc,
      tipoDoc: entity.tipoDoc,
      nomPers: entity.nomPers,
      correo: entity.correo,
      telPers: entity.telPers,
    };
  }
}
