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
import { AgendaCitaService } from '../services/agenda-cita.service';
import { CreateAgendaCitaDto, UpdateAgendaCitaDto, AgendaCitaResponseDto } from '../dtos';
import { AuthGuard, RolesGuard } from '../../auth/guards';
import { Roles } from '../../auth/decorators';

@Controller('agenda-citas')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@UseGuards(AuthGuard, RolesGuard)
@Roles('administrador', 'medico', 'enfermero', 'personal_administrativo')
export class AgendaCitaController {
  constructor(private readonly agendaCitaService: AgendaCitaService) {}

  @Get()
  async findAll(
    @Query('estado') estado?: string,
    @Query('idEmp') idEmp?: string,
    @Query('codPac') codPac?: string,
    @Query('fecha') fecha?: string,
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
    @Query('idSede') idSede?: string,
  ): Promise<AgendaCitaResponseDto[]> {
    if (estado) {
      return this.agendaCitaService.findByEstado(estado);
    }
    if (idEmp) {
      return this.agendaCitaService.findByEmpleado(parseInt(idEmp));
    }
    if (codPac) {
      return this.agendaCitaService.findByPaciente(parseInt(codPac));
    }
    if (fecha) {
      return this.agendaCitaService.findByFecha(fecha);
    }
    if (fechaInicio && fechaFin) {
      return this.agendaCitaService.findByFechaRango(fechaInicio, fechaFin);
    }
    if (idSede) {
      return this.agendaCitaService.findBySede(parseInt(idSede));
    }
    return this.agendaCitaService.findAll();
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number): Promise<AgendaCitaResponseDto> {
    return this.agendaCitaService.findById(id);
  }

  @Post()
  @Roles('administrador', 'medico', 'enfermero', 'personal_administrativo')
  async create(@Body() dto: CreateAgendaCitaDto): Promise<AgendaCitaResponseDto> {
    return this.agendaCitaService.create(dto);
  }

  @Put(':id')
  @Roles('administrador', 'medico', 'enfermero')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAgendaCitaDto,
  ): Promise<AgendaCitaResponseDto> {
    return this.agendaCitaService.update(id, dto);
  }

  @Delete(':id')
  @Roles('administrador')
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.agendaCitaService.delete(id);
  }

  @Get('estadisticas/total')
  async count(): Promise<{ total: number }> {
    const total = await this.agendaCitaService.count();
    return { total };
  }
}
