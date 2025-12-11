export class AuditoriaResponseDto {
  idEvento: number;
  numDoc: string;
  accion: string;
  fechaEvento: string;
  tablaAfectada?: string;
  ipOrigen?: string;
  persona?: {
    numDoc: string;
    nomPers: string;
    correo: string;
    telPers: string;
  };
}
