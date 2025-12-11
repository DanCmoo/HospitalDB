import { IsOptional, IsNumber, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class MedicamentosMasRecetadosDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  idSede?: number;
}

export class MedicosConMasConsultasDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  idSede?: number;
}

export class TiempoPromedioDiagnosticoDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  idSede?: number;
}

export class AuditoriaHistorialesDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limite?: number = 10;
}

export class DepartamentosEquipamientoCompartidoDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  idSede?: number;
}

export class PacientesPorEnfermedadDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  idSede?: number;

  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @IsOptional()
  @IsDateString()
  fechaFin?: string;
}
