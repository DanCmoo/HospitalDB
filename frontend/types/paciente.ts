export interface Paciente {
  codPac: number;
  idSede: number;
  numDoc: string;
  drPac: string;
  fechaNac: string;
  genero: string;
  estadoPaciente?: string;
  fechaRegistro?: string;
  ultimaModificacion?: string;
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
  idSede: number;
  numDoc: string;
  drPac?: string;
  fechaNac: string;
  genero: string;
  estadoPaciente?: string;
}

export interface UpdatePacienteDto {
  drPac?: string;
  fechaNac?: string;
  genero?: string;
  estadoPaciente?: string;
}
