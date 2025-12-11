import { IsInt, IsString, IsEnum, IsOptional, IsDateString, IsArray } from 'class-validator';

export enum EstadoEquipamiento {
  OPERATIVO = 'Operativo',
  EN_MANTENIMIENTO = 'En Mantenimiento',
  FUERA_DE_SERVICIO = 'Fuera de Servicio',
}

export class CreateEquipamientoDto {
  @IsInt()
  codEq: number;

  @IsString()
  nomEq: string;

  @IsEnum(EstadoEquipamiento)
  estado: EstadoEquipamiento;

  @IsOptional()
  @IsDateString()
  fechaMant?: string;

  @IsInt()
  idEmp: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  departamentos?: string[];
}
