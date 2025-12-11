export class DepartamentoResponseDto {
  nomDept: string;
  idSede: number;
  sede?: {
    idSede: number;
    nomSede: string;
    ciudad: string;
    direccion: string;
    telefono: string;
  };
}
