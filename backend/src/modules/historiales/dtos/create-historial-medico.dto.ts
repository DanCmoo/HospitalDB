import { IsInt, IsString, IsDateString } from 'class-validator';

export class CreateHistorialMedicoDto {
  @IsInt()
  codHist: number;

  @IsDateString()
  fecha: string;

  @IsString()
  hora: string;

  @IsString()
  diagnostico: string;

  @IsInt()
  idSede: number;

  @IsString()
  nomDept?: string;

  @IsInt()
  idEmp: number;

  @IsInt()
  codPac: number;
}
