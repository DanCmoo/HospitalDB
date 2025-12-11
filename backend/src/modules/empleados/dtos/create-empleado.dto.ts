import { IsString, IsNumber, IsOptional, Length, Min } from 'class-validator';

export class CreateEmpleadoDto {
  @IsString()
  @Length(5, 20)
  numDoc: string;

  @IsString()
  @IsOptional()
  @Length(1, 100)
  hashContrato?: string;

  @IsNumber()
  @Min(1)
  idSede: number;

  @IsString()
  @Length(1, 30)
  nomDept: string;

  @IsString()
  @Length(1, 30)
  cargo: string;
}
