import { IsInt, Min } from 'class-validator';

export class UpdateStockDto {
  @IsInt()
  cantidad: number; // Positivo para aumentar, negativo para disminuir
}
