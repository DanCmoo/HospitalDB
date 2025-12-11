import { IsOptional, IsDateString } from 'class-validator';

export class GenerarReporteGeneralDto {
  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @IsOptional()
  @IsDateString()
  fechaFin?: string;
}
