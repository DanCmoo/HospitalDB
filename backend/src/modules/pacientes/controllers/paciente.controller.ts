import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { PacienteService } from '../services/paciente.service';
import { CreatePacienteDto, UpdatePacienteDto, PacienteResponseDto } from '../dtos';
import { AuthGuard, RolesGuard } from '../../auth/guards';
import { Roles } from '../../auth/decorators';

@Controller('pacientes')
@UseGuards(AuthGuard, RolesGuard)
export class PacienteController {
  constructor(private readonly pacienteService: PacienteService) {}

  @Post()
  @Roles('administrador', 'medico', 'enfermero', 'personal_administrativo')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPacienteDto: CreatePacienteDto): Promise<PacienteResponseDto> {
    return this.pacienteService.create(createPacienteDto);
  }

  @Get()
  @Roles('administrador', 'medico', 'enfermero', 'personal_administrativo')
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('genero') genero?: string,
  ): Promise<PacienteResponseDto[] | { data: PacienteResponseDto[]; total: number; page: number; limit: number }> {
    if (genero) {
      return this.pacienteService.findByGenero(genero);
    }

    if (page && limit) {
      return this.pacienteService.findWithPagination(page, limit);
    }

    return this.pacienteService.findAll();
  }

  @Get('search')
  async search(@Query('term') term: string): Promise<PacienteResponseDto[]> {
    return this.pacienteService.search(term);
  }

  @Get('count')
  async count(): Promise<{ count: number }> {
    const count = await this.pacienteService.count();
    return { count };
  }

  @Get('next-codigo')
  async getNextCodigo(): Promise<{ nextCodigo: number }> {
    const nextCodigo = await this.pacienteService.getNextCodigo();
    return { nextCodigo };
  }

  @Get(':codigo')
  async findByCodigo(@Param('codigo', ParseIntPipe) codigo: number): Promise<PacienteResponseDto> {
    return this.pacienteService.findByCodigo(codigo);
  }

  @Put(':codigo')
  @Roles('administrador', 'medico', 'personal_administrativo')
  async update(
    @Param('codigo', ParseIntPipe) codigo: number,
    @Body() updatePacienteDto: UpdatePacienteDto,
  ): Promise<PacienteResponseDto> {
    return this.pacienteService.update(codigo, updatePacienteDto);
  }

  @Delete(':codigo')
  @Roles('administrador')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('codigo', ParseIntPipe) codigo: number): Promise<void> {
    return this.pacienteService.delete(codigo);
  }
}
