import { IsInt, IsString, IsEnum, IsDateString, IsOptional } from 'class-validator';
import { EstadoCita } from '../entities/agenda-cita.entity';

export class CreateAgendaCitaDto {
  @IsInt()
  idCita: number;

  @IsDateString()
  fecha: string;

  @IsString()
  hora: string;

  @IsString()
  tipoServicio: string;

  @IsEnum(EstadoCita)
  estado: EstadoCita;

  @IsInt()
  idSede: number;

  @IsOptional()
  @IsString()
  nomDept?: string;

  @IsInt()
  idEmp: number;

  @IsInt()
  codPac: number;
}
