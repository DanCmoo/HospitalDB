import { IsString, IsNumber, IsOptional, Length, Min } from 'class-validator';

export class UpdateEmpleadoDto {
  @IsString()
  @IsOptional()
  @Length(1, 100)
  hashContrato?: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  idSede?: number;

  @IsString()
  @Length(1, 30)
  @IsOptional()
  nomDept?: string;

  @IsString()
  @Length(1, 30)
  @IsOptional()
  cargo?: string;
}
