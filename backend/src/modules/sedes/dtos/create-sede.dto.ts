import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateSedeDto {
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  idSede: number;

  @IsString()
  @MaxLength(20)
  @IsOptional()
  telefono?: string;

  @IsString()
  @MaxLength(50)
  @IsNotEmpty()
  direccion: string;

  @IsString()
  @MaxLength(30)
  @IsNotEmpty()
  nomSede: string;

  @IsString()
  @MaxLength(20)
  @IsNotEmpty()
  ciudad: string;
}
