import { IsString, IsOptional, MinLength, IsEnum, IsBoolean } from 'class-validator';

export class UpdateUsuarioDto {
  @IsString()
  @IsOptional()
  @MinLength(6)
  password?: string;

  @IsEnum(['administrador', 'medico', 'enfermero', 'personal_administrativo'])
  @IsOptional()
  rol?: 'administrador' | 'medico' | 'enfermero' | 'personal_administrativo';

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
