export class UsuarioResponseDto {
  idUsuario: number;
  numDoc: string;
  username: string;
  rol: 'administrador' | 'medico' | 'enfermero' | 'personal_administrativo';
  activo: boolean;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  persona?: {
    numDoc: string;
    tipoDoc: string;
    nomPers: string;
    correo: string;
    telPers: string;
  };
}
