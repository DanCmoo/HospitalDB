import { IsInt, IsString, IsDateString, IsOptional } from 'class-validator';

export class CreateAuditoriaDto {
  @IsInt()
  idEvento: number;

  @IsString()
  numDoc: string;

  @IsString()
  accion: string;

  @IsDateString()
  fechaEvento: string;

  @IsOptional()
  @IsString()
  tablaAfectada?: string;

  @IsOptional()
  @IsString()
  ipOrigen?: string;
}
