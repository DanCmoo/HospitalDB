import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PacienteRepository } from '../repositories/paciente.repository';
import { PersonaRepository } from '../../personas/repositories/persona.repository';
import { CreatePacienteDto, UpdatePacienteDto, PacienteResponseDto } from '../dtos';
import { PacienteEntity } from '../entities/paciente.entity';
import { SedeConfig } from '../../../config/sede.config';

@Injectable()
export class PacienteService {
  constructor(
    private readonly pacienteRepository: PacienteRepository,
    private readonly personaRepository: PersonaRepository,
  ) {}

  async create(createPacienteDto: CreatePacienteDto): Promise<PacienteResponseDto> {
    // Verificar que el código no exista
    const idSede = SedeConfig.getIdSede();
    const existingByCodigo = await this.pacienteRepository.findByCodigo(createPacienteDto.codPac, idSede);
    if (existingByCodigo) {
      throw new ConflictException(
        `Paciente con código ${createPacienteDto.codPac} ya existe`,
      );
    }

    // Verificar que el numDoc no esté ya asignado a otro paciente
    const existingByDoc = await this.pacienteRepository.findByNumDoc(createPacienteDto.numDoc);
    if (existingByDoc) {
      throw new ConflictException(
        `Ya existe un paciente con documento ${createPacienteDto.numDoc}`,
      );
    }

    // Verificar que la persona exista
    const persona = await this.personaRepository.findByNumDoc(createPacienteDto.numDoc);
    if (!persona) {
      throw new NotFoundException(
        `Persona con documento ${createPacienteDto.numDoc} no encontrada`,
      );
    }

    // Auto-asignar id_sede
    const entity = await this.pacienteRepository.create({
      ...createPacienteDto,
      fechaNac: new Date(createPacienteDto.fechaNac),
      idSede,
    });

    return this.mapEntityToDto(entity);
  }

  async findAll(): Promise<PacienteResponseDto[]> {
    const entities = await this.pacienteRepository.findAll();
    return entities.map((entity) => this.mapEntityToDto(entity));
  }

  async findByCodigo(codPac: number, idSede?: number): Promise<PacienteResponseDto> {
    const sede = idSede || SedeConfig.getIdSede();
    const entity = await this.pacienteRepository.findByCodigo(codPac, sede);
    if (!entity) {
      throw new NotFoundException(`Paciente con código ${codPac} no encontrado`);
    }
    return this.mapEntityToDto(entity);
  }

  async findByGenero(genero: string): Promise<PacienteResponseDto[]> {
    const entities = await this.pacienteRepository.findByGenero(genero);
    return entities.map((entity) => this.mapEntityToDto(entity));
  }

  async search(searchTerm: string): Promise<PacienteResponseDto[]> {
    const entities = await this.pacienteRepository.search(searchTerm);
    return entities.map((entity) => this.mapEntityToDto(entity));
  }

  async update(codPac: number, updatePacienteDto: UpdatePacienteDto, idSede?: number): Promise<PacienteResponseDto> {
    const sede = idSede || SedeConfig.getIdSede();
    const existing = await this.pacienteRepository.findByCodigo(codPac, sede);
    if (!existing) {
      throw new NotFoundException(`Paciente con código ${codPac} no encontrado`);
    }

    const updateData: any = { ...updatePacienteDto };
    if (updatePacienteDto.fechaNac) {
      updateData.fechaNac = new Date(updatePacienteDto.fechaNac);
    }

    const updated = await this.pacienteRepository.update(codPac, sede, updateData);
    return this.mapEntityToDto(updated);
  }

  async delete(codPac: number, idSede?: number): Promise<void> {
    const sede = idSede || SedeConfig.getIdSede();
    const existing = await this.pacienteRepository.findByCodigo(codPac, sede);
    if (!existing) {
      throw new NotFoundException(`Paciente con código ${codPac} no encontrado`);
    }

    await this.pacienteRepository.delete(codPac, sede);
  }

  async count(): Promise<number> {
    return this.pacienteRepository.count();
  }

  async getNextCodigo(): Promise<number> {
    return this.pacienteRepository.getNextCodigo();
  }

  async findWithPagination(
    page: number,
    limit: number,
  ): Promise<{ data: PacienteResponseDto[]; total: number; page: number; limit: number }> {
    const [entities, total] = await this.pacienteRepository.findWithPagination(page, limit);
    return {
      data: entities.map((entity) => this.mapEntityToDto(entity)),
      total,
      page,
      limit,
    };
  }

  private calculateAge(fechaNac: Date): number {
    const today = new Date();
    const birthDate = new Date(fechaNac);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  private mapEntityToDto(entity: PacienteEntity): PacienteResponseDto {
    return {
      codPac: entity.codPac,
      numDoc: entity.numDoc,
      drPac: entity.drPac,
      fechaNac: entity.fechaNac.toISOString().split('T')[0],
      genero: entity.genero,
      edad: this.calculateAge(entity.fechaNac),
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
