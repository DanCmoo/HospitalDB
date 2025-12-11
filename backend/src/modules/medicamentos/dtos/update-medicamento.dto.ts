import { IsString, IsOptional, IsInt, Min } from 'class-validator';

export class UpdateMedicamentoDto {
  @IsOptional()
  @IsString()
  nomMed?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsString()
  proveedor?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;
}
