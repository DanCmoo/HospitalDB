export class ActivityLogResponseDto {
  idLog: number;
  idUsuario: number;
  accion: string;
  detalles?: string;
  ipAddress?: string;
  fechaAccion: Date;
  usuario?: {
    username: string;
    rol: string;
    persona?: {
      nomPers: string;
    };
  };
}
