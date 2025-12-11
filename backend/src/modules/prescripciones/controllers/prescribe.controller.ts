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
import { PrescribeService } from '../services/prescribe.service';
import { CreatePrescribeDto, UpdatePrescribeDto, PrescribeResponseDto } from '../dtos';
import { AuthGuard, RolesGuard } from '../../auth/guards';
import { Roles } from '../../auth/decorators';

@Controller('prescripciones')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@UseGuards(AuthGuard, RolesGuard)
@Roles('administrador', 'medico')
export class PrescribeController {
  constructor(private readonly prescribeService: PrescribeService) {}

  @Get()
  @Roles('administrador', 'medico', 'enfermero')
  async findAll(
    @Query('idCita') idCita?: string,
    @Query('codMed') codMed?: string,
  ): Promise<PrescribeResponseDto[]> {
    if (idCita) {
      return this.prescribeService.findByCita(parseInt(idCita));
    }
    if (codMed) {
      return this.prescribeService.findByMedicamento(parseInt(codMed));
    }
    return this.prescribeService.findAll();
  }

  @Get(':codMed/:idCita')
  async findOne(
    @Param('codMed', ParseIntPipe) codMed: number,
    @Param('idCita', ParseIntPipe) idCita: number,
  ): Promise<PrescribeResponseDto> {
    return this.prescribeService.findOne(codMed, idCita);
  }

  @Post()
  async create(@Body() dto: CreatePrescribeDto): Promise<PrescribeResponseDto> {
    return this.prescribeService.create(dto);
  }

  @Put(':codMed/:idCita')
  async update(
    @Param('codMed', ParseIntPipe) codMed: number,
    @Param('idCita', ParseIntPipe) idCita: number,
    @Body() dto: UpdatePrescribeDto,
  ): Promise<PrescribeResponseDto> {
    return this.prescribeService.update(codMed, idCita, dto);
  }

  @Delete(':codMed/:idCita')
  async delete(
    @Param('codMed', ParseIntPipe) codMed: number,
    @Param('idCita', ParseIntPipe) idCita: number,
  ): Promise<void> {
    return this.prescribeService.delete(codMed, idCita);
  }

  @Get('estadisticas/total')
  async count(): Promise<{ total: number }> {
    const total = await this.prescribeService.count();
    return { total };
  }
}
