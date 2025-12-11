export interface HistorialMedico {
  codHist: number;
  idSede: number;
  fecha: string;
  hora: string;
  diagnostico: string;
  nomDept?: string;
  idEmp: number;
  codPac: number;
  compartido?: boolean;
  nivelAcceso?: string;
  fechaCreacion?: string;
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
}

export interface CreateHistorialMedicoDto {
  codHist: number;
  idSede: number;
  fecha: string;
  hora: string;
  diagnostico: string;
  nomDept?: string;
  idEmp: number;
  codPac: number;
  compartido?: boolean;
  nivelAcceso?: string;
}

export interface UpdateHistorialMedicoDto {
  fecha?: string;
  hora?: string;
  diagnostico?: string;
  nomDept?: string;
  compartido?: boolean;
  nivelAcceso?: string;
}
