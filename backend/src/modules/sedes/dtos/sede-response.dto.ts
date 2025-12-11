export class SedeResponseDto {
  idSede: number;
  telefono: string;
  direccion: string;
  nomSede: string;
  ciudad: string;
  departamentos?: {
    nomDept: string;
    idSede: number;
  }[];
}
