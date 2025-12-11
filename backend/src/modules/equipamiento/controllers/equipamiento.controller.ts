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
import { EquipamientoService } from '../services/equipamiento.service';
import { CreateEquipamientoDto, UpdateEquipamientoDto, EquipamientoResponseDto } from '../dtos';
import { AuthGuard, RolesGuard } from '../../auth/guards';
import { Roles } from '../../auth/decorators';

@Controller('equipamiento')
@UseGuards(AuthGuard, RolesGuard)
export class EquipamientoController {
  constructor(private readonly equipamientoService: EquipamientoService) {}

  @Post()
  @Roles('administrador', 'personal_administrativo')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createEquipamientoDto: CreateEquipamientoDto,
  ): Promise<EquipamientoResponseDto> {
    return this.equipamientoService.create(createEquipamientoDto);
  }

  @Get()
  @Roles('administrador', 'medico', 'enfermero', 'personal_administrativo')
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('estado') estado?: string,
    @Query('empleado', new ParseIntPipe({ optional: true })) empleado?: number,
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
  @Roles('administrador', 'medico', 'enfermero', 'personal_administrativo')
  async search(@Query('term') term: string): Promise<EquipamientoResponseDto[]> {
    return this.equipamientoService.search(term);
  }

  @Get('count')
  @Roles('administrador', 'medico', 'enfermero', 'personal_administrativo')
  async count(): Promise<{ count: number }> {
    const count = await this.equipamientoService.count();
    return { count };
  }

  @Get('next-codigo')
  @Roles('administrador', 'medico', 'enfermero', 'personal_administrativo')
  async getNextCodigo(): Promise<{ nextCodigo: number }> {
    const nextCodigo = await this.equipamientoService.getNextCodigo();
    return { nextCodigo };
  }

  @Get(':codigo')
  @Roles('administrador', 'medico', 'enfermero', 'personal_administrativo')
  async findByCodigo(
    @Param('codigo', ParseIntPipe) codigo: number,
  ): Promise<EquipamientoResponseDto> {
    return this.equipamientoService.findByCodigo(codigo);
  }

  @Put(':codigo')
  @Roles('administrador', 'personal_administrativo')
  async update(
    @Param('codigo', ParseIntPipe) codigo: number,
    @Body() updateEquipamientoDto: UpdateEquipamientoDto,
  ): Promise<EquipamientoResponseDto> {
    return this.equipamientoService.update(codigo, updateEquipamientoDto);
  }

  @Delete(':codigo')
  @Roles('administrador', 'personal_administrativo')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('codigo', ParseIntPipe) codigo: number): Promise<void> {
    return this.equipamientoService.delete(codigo);
  }
}
