export class PacienteResponseDto {
  codPac: number;
  numDoc: string;
  drPac: string;
  fechaNac: string;
  genero: string;
  edad?: number;
  persona?: {
    numDoc: string;
    tipoDoc: string;
    nomPers: string;
    correo: string;
    telPers: string;
  };
}
