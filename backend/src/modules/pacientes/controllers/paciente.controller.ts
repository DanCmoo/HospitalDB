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
} from '@nestjs/common';
import { PacienteService } from '../services/paciente.service';
import { CreatePacienteDto, UpdatePacienteDto, PacienteResponseDto } from '../dtos';

@Controller('pacientes')
export class PacienteController {
  constructor(private readonly pacienteService: PacienteService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPacienteDto: CreatePacienteDto): Promise<PacienteResponseDto> {
    return this.pacienteService.create(createPacienteDto);
  }

  @Get()
  async findAll(
    @Query('page', ParseIntPipe) page?: number,
    @Query('limit', ParseIntPipe) limit?: number,
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
  async update(
    @Param('codigo', ParseIntPipe) codigo: number,
    @Body() updatePacienteDto: UpdatePacienteDto,
  ): Promise<PacienteResponseDto> {
    return this.pacienteService.update(codigo, updatePacienteDto);
  }

  @Delete(':codigo')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('codigo', ParseIntPipe) codigo: number): Promise<void> {
    return this.pacienteService.delete(codigo);
  }
}
