import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ValidationPipe,
  UsePipes,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { HistorialMedicoService } from '../services/historial-medico.service';
import { CreateHistorialMedicoDto, UpdateHistorialMedicoDto, HistorialMedicoResponseDto } from '../dtos';
import { AuthGuard, RolesGuard } from '../../auth/guards';
import { Roles } from '../../auth/decorators';

@Controller('historiales')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@UseGuards(AuthGuard, RolesGuard)
@Roles('administrador', 'medico')
export class HistorialMedicoController {
  constructor(private readonly historialService: HistorialMedicoService) {}

  @Get()
  @Roles('administrador', 'medico', 'enfermero')
  async findAll(
    @Query('codPac') codPac?: string,
    @Query('idEmp') idEmp?: string,
    @Query('fecha') fecha?: string,
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
    @Query('idSede') idSede?: string,
  ): Promise<HistorialMedicoResponseDto[]> {
    if (codPac) {
      return this.historialService.findByPaciente(parseInt(codPac));
    }
    if (idEmp) {
      return this.historialService.findByEmpleado(parseInt(idEmp));
    }
    if (fecha) {
      return this.historialService.findByFecha(fecha);
    }
    if (fechaInicio && fechaFin) {
      return this.historialService.findByFechaRango(fechaInicio, fechaFin);
    }
    if (idSede) {
      return this.historialService.findBySede(parseInt(idSede));
    }
    return this.historialService.findAll();
  }

  @Get(':id')
  @Roles('administrador', 'medico', 'enfermero')
  async findById(@Param('id', ParseIntPipe) id: number): Promise<HistorialMedicoResponseDto> {
    return this.historialService.findById(id);
  }

  @Post()
  async create(@Body() dto: CreateHistorialMedicoDto): Promise<HistorialMedicoResponseDto> {
    return this.historialService.create(dto);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateHistorialMedicoDto,
  ): Promise<HistorialMedicoResponseDto> {
    return this.historialService.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.historialService.delete(id);
  }

  @Get('estadisticas/total')
  async count(): Promise<{ total: number }> {
    const total = await this.historialService.count();
    return { total };
  }

  @Get('consolidado/todas-sedes')
  async findConsolidadoTodasSedes(
    @Query('codPac') codPac?: string,
  ): Promise<HistorialMedicoResponseDto[]> {
    return this.historialService.findConsolidadoTodasSedes(codPac ? parseInt(codPac) : undefined);
  }
}
