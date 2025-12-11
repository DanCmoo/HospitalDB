export enum EstadoCita {
  Programada = 'Programada',
  Completada = 'Completada',
  Cancelada = 'Cancelada',
  NoAsistio = 'No Asistió',
}

export interface AgendaCita {
  idCita: number;
  fecha: string;
  hora: string;
  tipoServicio: string;
  estado: EstadoCita;
  idSede: number;
  nomDept?: string;
  idEmp: number;
  codPac: number;
  empleado?: {
    idEmp: number;
    cargo: string;
    persona?: {
      nomPers: string;
      correo: string;
      telPers: string;
    };
  };
  paciente?: {
    codPac: number;
    numDoc: string;
    genero: string;
    persona?: {
      nomPers: string;
      correo: string;
      telPers: string;
    };
  };
  prescripciones?: {
    codMed: number;
    dosis: number;
    frecuencia: number;
    duracion: string;
    fechaEmision: string;
    medicamento?: {
      nomMed: string;
    };
  }[];
}

export interface CreateAgendaCitaDto {
  idCita: number;
  fecha: string;
  hora: string;
  tipoServicio: string;
  estado: EstadoCita;
  idSede: number;
  nomDept?: string;
  idEmp: number;
  codPac: number;
}

export interface UpdateAgendaCitaDto {
  fecha?: string;
  hora?: string;
  tipoServicio?: string;
  estado?: EstadoCita;
  nomDept?: string;
}
