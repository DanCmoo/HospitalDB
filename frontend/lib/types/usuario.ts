export interface Usuario {
  idUsuario: number;
  numDoc: string;
  correo: string;
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

export interface CreateUsuarioDto {
  numDoc: string;
  correo: string;
  password: string;
  rol?: 'administrador' | 'medico' | 'enfermero' | 'personal_administrativo';
  activo?: boolean;
}

export interface UpdateUsuarioDto {
  password?: string;
  rol?: 'administrador' | 'medico' | 'enfermero' | 'personal_administrativo';
  activo?: boolean;
}

export interface LoginDto {
  email: string;
  password: string;
}
