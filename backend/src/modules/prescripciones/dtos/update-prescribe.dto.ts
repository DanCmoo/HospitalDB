import { IsInt, IsDateString, IsOptional, Min } from 'class-validator';

export class UpdatePrescribeDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  dosis?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  frecuencia?: number;

  @IsOptional()
  @IsDateString()
  duracion?: string;

  @IsOptional()
  @IsDateString()
  fechaEmision?: string;
}
