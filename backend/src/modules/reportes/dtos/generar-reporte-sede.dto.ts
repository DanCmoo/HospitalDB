import { IsOptional, IsDateString, IsInt } from 'class-validator';

export class GenerarReporteSedeDto {
  @IsInt()
  idSede: number;

  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @IsOptional()
  @IsDateString()
  fechaFin?: string;
}
