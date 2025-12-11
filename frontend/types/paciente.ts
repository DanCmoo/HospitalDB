export interface Paciente {
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

export interface CreatePacienteDto {
  codPac: number;
  numDoc: string;
  drPac?: string;
  fechaNac: string;
  genero: string;
}

export interface UpdatePacienteDto {
  drPac?: string;
  fechaNac?: string;
  genero?: string;
}
