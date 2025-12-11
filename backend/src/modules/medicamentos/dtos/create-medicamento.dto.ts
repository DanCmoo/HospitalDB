import { IsInt, IsString, IsOptional, Min } from 'class-validator';

export class CreateMedicamentoDto {
  @IsInt()
  codMed: number;

  @IsString()
  nomMed: string;

  @IsInt()
  @Min(0)
  stock: number;

  @IsOptional()
  @IsString()
  proveedor?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;
}
