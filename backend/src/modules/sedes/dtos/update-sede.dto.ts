import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateSedeDto {
  @IsString()
  @MaxLength(20)
  @IsOptional()
  telefono?: string;

  @IsString()
  @MaxLength(50)
  @IsOptional()
  direccion?: string;

  @IsString()
  @MaxLength(30)
  @IsOptional()
  nomSede?: string;

  @IsString()
  @MaxLength(20)
  @IsOptional()
  ciudad?: string;
}
