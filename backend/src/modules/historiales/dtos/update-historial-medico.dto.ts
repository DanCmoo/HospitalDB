import { IsString, IsDateString, IsOptional } from 'class-validator';

export class UpdateHistorialMedicoDto {
  @IsOptional()
  @IsDateString()
  fecha?: string;

  @IsOptional()
  @IsString()
  hora?: string;

  @IsOptional()
  @IsString()
  diagnostico?: string;

  @IsOptional()
  @IsString()
  nomDept?: string;
}
