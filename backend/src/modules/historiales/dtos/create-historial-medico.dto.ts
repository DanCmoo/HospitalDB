import { IsInt, IsString, IsDateString, IsBoolean, IsOptional } from 'class-validator';

export class CreateHistorialMedicoDto {
  @IsInt()
  codHist: number;

  @IsInt()
  idSede: number;

  @IsDateString()
  fecha: string;

  @IsString()
  hora: string;

  @IsString()
  diagnostico: string;

  @IsString()
  @IsOptional()
  nomDept?: string;

  @IsInt()
  idEmp: number;

  @IsInt()
  codPac: number;

  @IsBoolean()
  @IsOptional()
  compartido?: boolean;

  @IsString()
  @IsOptional()
  nivelAcceso?: string;
}
