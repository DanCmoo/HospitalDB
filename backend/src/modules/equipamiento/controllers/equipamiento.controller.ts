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
import { EquipamientoService } from '../services/equipamiento.service';
import { CreateEquipamientoDto, UpdateEquipamientoDto, EquipamientoResponseDto } from '../dtos';

@Controller('equipamiento')
export class EquipamientoController {
  constructor(private readonly equipamientoService: EquipamientoService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createEquipamientoDto: CreateEquipamientoDto,
  ): Promise<EquipamientoResponseDto> {
    return this.equipamientoService.create(createEquipamientoDto);
  }

  @Get()
  async findAll(
    @Query('page', ParseIntPipe) page?: number,
    @Query('limit', ParseIntPipe) limit?: number,
    @Query('estado') estado?: string,
    @Query('empleado', ParseIntPipe) empleado?: number,
    @Query('departamento') departamento?: string,
  ): Promise<
    | EquipamientoResponseDto[]
    | { data: EquipamientoResponseDto[]; total: number; page: number; limit: number }
  > {
    if (estado) {
      return this.equipamientoService.findByEstado(estado);
    }

    if (empleado) {
      return this.equipamientoService.findByEmpleado(empleado);
    }

    if (departamento) {
      return this.equipamientoService.findByDepartamento(departamento);
    }

    if (page && limit) {
      return this.equipamientoService.findWithPagination(page, limit);
    }

    return this.equipamientoService.findAll();
  }

  @Get('search')
  async search(@Query('term') term: string): Promise<EquipamientoResponseDto[]> {
    return this.equipamientoService.search(term);
  }

  @Get('count')
  async count(): Promise<{ count: number }> {
    const count = await this.equipamientoService.count();
    return { count };
  }

  @Get('next-codigo')
  async getNextCodigo(): Promise<{ nextCodigo: number }> {
    const nextCodigo = await this.equipamientoService.getNextCodigo();
    return { nextCodigo };
  }

  @Get(':codigo')
  async findByCodigo(
    @Param('codigo', ParseIntPipe) codigo: number,
  ): Promise<EquipamientoResponseDto> {
    return this.equipamientoService.findByCodigo(codigo);
  }

  @Put(':codigo')
  async update(
    @Param('codigo', ParseIntPipe) codigo: number,
    @Body() updateEquipamientoDto: UpdateEquipamientoDto,
  ): Promise<EquipamientoResponseDto> {
    return this.equipamientoService.update(codigo, updateEquipamientoDto);
  }

  @Delete(':codigo')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('codigo', ParseIntPipe) codigo: number): Promise<void> {
    return this.equipamientoService.delete(codigo);
  }
}
