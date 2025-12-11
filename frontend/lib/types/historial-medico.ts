export interface HistorialMedico {
  codHist: number;
  fecha: string;
  hora: string;
  diagnostico: string;
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
}

export interface CreateHistorialMedicoDto {
  codHist: number;
  fecha: string;
  hora: string;
  diagnostico: string;
  idSede: number;
  nomDept?: string;
  idEmp: number;
  codPac: number;
}

export interface UpdateHistorialMedicoDto {
  fecha?: string;
  hora?: string;
  diagnostico?: string;
  nomDept?: string;
}
