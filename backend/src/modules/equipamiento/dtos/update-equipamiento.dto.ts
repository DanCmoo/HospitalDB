import { IsString, IsEnum, IsOptional, IsDateString, IsArray } from 'class-validator';
import { EstadoEquipamiento } from './create-equipamiento.dto';

export class UpdateEquipamientoDto {
  @IsOptional()
  @IsString()
  nomEq?: string;

  @IsOptional()
  @IsEnum(EstadoEquipamiento)
  estado?: EstadoEquipamiento;

  @IsOptional()
  @IsDateString()
  fechaMant?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  departamentos?: string[];
}
