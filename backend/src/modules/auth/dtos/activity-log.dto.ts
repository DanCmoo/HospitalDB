export class ActivityLogResponseDto {
  idLog: number;
  idUsuario: number;
  accion: string;
  detalles?: string;
  ipAddress?: string;
  userAgent?: string;
  fechaAccion: Date;
  usuario?: {
    correo: string;
    rol: string;
    nomPers?: string;
  };
}
