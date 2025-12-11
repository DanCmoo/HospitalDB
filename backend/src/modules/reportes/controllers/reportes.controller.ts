import {
  Controller,
  Get,
  Query,
  ValidationPipe,
  UsePipes,
  UseGuards,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ReportesService } from '../services/reportes.service';
import { GenerarReportePacienteDto, GenerarReporteSedeDto, GenerarReporteGeneralDto } from '../dtos';
import { AuthGuard, RolesGuard } from '../../auth/guards';
import { Roles } from '../../auth/decorators';

@Controller('reportes')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
@UseGuards(AuthGuard, RolesGuard)
@Roles('personal_administrativo', 'administrador')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get('paciente')
  async generarReportePaciente(
    @Query() dto: GenerarReportePacienteDto,
    @Res() res: Response,
  ): Promise<void> {
    const pdfBuffer = await this.reportesService.generarReportePaciente(dto);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="reporte_paciente_${dto.codPac}_${Date.now()}.pdf"`,
    );
    res.status(HttpStatus.OK).send(pdfBuffer);
  }

  @Get('general')
  async generarReporteGeneral(
    @Query() dto: GenerarReporteGeneralDto,
    @Res() res: Response,
  ): Promise<void> {
    const pdfBuffer = await this.reportesService.generarReporteGeneral(dto);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="reporte_general_${Date.now()}.pdf"`,
    );
    res.status(HttpStatus.OK).send(pdfBuffer);
  }

  @Get('sede')
  async generarReporteSede(
    @Query() dto: GenerarReporteSedeDto,
    @Res() res: Response,
  ): Promise<void> {
    const pdfBuffer = await this.reportesService.generarReporteSede(dto);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="reporte_sede_${dto.idSede}_${Date.now()}.pdf"`,
    );
    res.status(HttpStatus.OK).send(pdfBuffer);
  }
}
