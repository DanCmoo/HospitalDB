import { IsOptional, IsString, IsDateString, MaxLength } from 'class-validator';

export class UpdatePacienteDto {
  @IsString()
  @MaxLength(80)
  @IsOptional()
  drPac?: string;

  @IsDateString()
  @IsOptional()
  fechaNac?: string;

  @IsString()
  @MaxLength(20)
  @IsOptional()
  genero?: string;
}
