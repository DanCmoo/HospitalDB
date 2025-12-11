import { IsInt, IsNotEmpty, IsOptional, IsString, IsDateString, MaxLength, Min } from 'class-validator';

export class CreatePacienteDto {
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  codPac: number;

  @IsString()
  @MaxLength(20)
  @IsNotEmpty()
  numDoc: string;

  @IsString()
  @MaxLength(80)
  @IsOptional()
  drPac?: string;

  @IsDateString()
  @IsNotEmpty()
  fechaNac: string;

  @IsString()
  @MaxLength(20)
  @IsNotEmpty()
  genero: string;
}
