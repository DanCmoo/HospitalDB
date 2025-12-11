import { IsString, IsNumber, IsOptional, IsBoolean, Length, Min } from 'class-validator';

export class CreateEmpleadoDto {
  @IsNumber()
  @Min(1)
  idEmp: number;

  @IsNumber()
  @Min(1)
  idSede: number;

  @IsString()
  @Length(5, 20)
  numDoc: string;

  @IsString()
  @IsOptional()
  @Length(1, 100)
  hashContrato?: string;

  @IsString()
  @Length(1, 30)
  nomDept: string;

  @IsString()
  @Length(1, 30)
  cargo: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
