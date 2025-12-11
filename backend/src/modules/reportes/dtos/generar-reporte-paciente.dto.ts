import { IsOptional, IsDateString, IsInt } from 'class-validator';

export class GenerarReportePacienteDto {
  @IsInt()
  codPac: number;

  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @IsOptional()
  @IsDateString()
  fechaFin?: string;
}
