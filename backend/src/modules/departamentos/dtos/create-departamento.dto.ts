import { IsInt, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator';

export class CreateDepartamentoDto {
  @IsString()
  @MaxLength(30)
  @IsNotEmpty()
  nomDept: string;

  @IsInt()
  @Min(1)
  @IsNotEmpty()
  idSede: number;
}
