export interface Departamento {
  nomDept: string;
  idSede: number;
  sede?: {
    idSede: number;
    nomSede: string;
    ciudad: string;
    direccion: string;
    telefono: string;
  };
}

export interface CreateDepartamentoRequest {
  nomDept: string;
  idSede: number;
}

export interface UpdateDepartamentoRequest {
  idSede?: number;
}
