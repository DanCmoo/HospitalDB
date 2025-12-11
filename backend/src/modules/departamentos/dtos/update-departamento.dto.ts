import { IsInt, IsOptional, Min } from 'class-validator';

export class UpdateDepartamentoDto {
  @IsInt()
  @Min(1)
  @IsOptional()
  idSede?: number;
}
