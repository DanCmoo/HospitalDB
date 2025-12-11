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
} from '@nestjs/common';
import { AgendaCitaService } from '../services/agenda-cita.service';
import { CreateAgendaCitaDto, UpdateAgendaCitaDto, AgendaCitaResponseDto } from '../dtos';

@Controller('agenda-citas')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
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
  async create(@Body() dto: CreateAgendaCitaDto): Promise<AgendaCitaResponseDto> {
    return this.agendaCitaService.create(dto);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAgendaCitaDto,
  ): Promise<AgendaCitaResponseDto> {
    return this.agendaCitaService.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.agendaCitaService.delete(id);
  }

  @Get('estadisticas/total')
  async count(): Promise<{ total: number }> {
    const total = await this.agendaCitaService.count();
    return { total };
  }
}
