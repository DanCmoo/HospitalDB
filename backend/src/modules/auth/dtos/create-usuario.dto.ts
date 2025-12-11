import { IsString, IsNotEmpty, MinLength, MaxLength, IsEnum, IsOptional, IsBoolean } from 'class-validator';

export class CreateUsuarioDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  numDoc: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsEnum(['administrador', 'medico', 'enfermero', 'personal_administrativo'])
  @IsOptional()
  rol?: 'administrador' | 'medico' | 'enfermero' | 'personal_administrativo';

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
