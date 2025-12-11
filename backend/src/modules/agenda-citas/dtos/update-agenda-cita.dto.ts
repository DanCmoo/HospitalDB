import { IsString, IsEnum, IsDateString, IsOptional } from 'class-validator';
import { EstadoCita } from '../entities/agenda-cita.entity';

export class UpdateAgendaCitaDto {
  @IsOptional()
  @IsDateString()
  fecha?: string;

  @IsOptional()
  @IsString()
  hora?: string;

  @IsOptional()
  @IsString()
  tipoServicio?: string;

  @IsOptional()
  @IsEnum(EstadoCita)
  estado?: EstadoCita;

  @IsOptional()
  @IsString()
  nomDept?: string;
}
