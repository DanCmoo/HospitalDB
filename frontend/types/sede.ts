export interface Sede {
  idSede: number;
  telefono: string;
  direccion: string;
  nomSede: string;
  ciudad: string;
  departamentos?: {
    nomDept: string;
    idSede: number;
  }[];
}

export interface CreateSedeRequest {
  idSede: number;
  telefono?: string;
  direccion: string;
  nomSede: string;
  ciudad: string;
}

export interface UpdateSedeRequest {
  telefono?: string;
  direccion?: string;
  nomSede?: string;
  ciudad?: string;
}
