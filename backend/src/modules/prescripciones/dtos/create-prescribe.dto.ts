import { IsInt, IsDateString, Min } from 'class-validator';

export class CreatePrescribeDto {
  @IsInt()
  codMed: number;

  @IsInt()
  idCita: number;

  @IsInt()
  @Min(1)
  idSede: number;

  @IsInt()
  @Min(1)
  dosis: number;

  @IsInt()
  @Min(1)
  frecuencia: number;

  @IsDateString()
  duracion: string;

  @IsDateString()
  fechaEmision: string;
}
