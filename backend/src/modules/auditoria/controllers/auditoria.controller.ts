import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  ValidationPipe,
  UsePipes,
  ParseIntPipe,
} from '@nestjs/common';
import { AuditoriaService } from '../services/auditoria.service';
import { CreateAuditoriaDto, AuditoriaResponseDto } from '../dtos';

@Controller('auditoria')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class AuditoriaController {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  @Get()
  async findAll(
    @Query('numDoc') numDoc?: string,
    @Query('accion') accion?: string,
    @Query('tablaAfectada') tablaAfectada?: string,
    @Query('fecha') fecha?: string,
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
  ): Promise<AuditoriaResponseDto[]> {
    if (numDoc) {
      return this.auditoriaService.findByPersona(numDoc);
    }
    if (accion) {
      return this.auditoriaService.findByAccion(accion);
    }
    if (tablaAfectada) {
      return this.auditoriaService.findByTabla(tablaAfectada);
    }
    if (fecha) {
      return this.auditoriaService.findByFecha(fecha);
    }
    if (fechaInicio && fechaFin) {
      return this.auditoriaService.findByFechaRango(fechaInicio, fechaFin);
    }
    return this.auditoriaService.findAll();
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number): Promise<AuditoriaResponseDto> {
    return this.auditoriaService.findById(id);
  }

  @Post()
  async create(@Body() dto: CreateAuditoriaDto): Promise<AuditoriaResponseDto> {
    return this.auditoriaService.create(dto);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.auditoriaService.delete(id);
  }

  @Get('estadisticas/total')
  async count(): Promise<{ total: number }> {
    const total = await this.auditoriaService.count();
    return { total };
  }
}
