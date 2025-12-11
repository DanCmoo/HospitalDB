export interface Empleado {
  idEmp: number;
  numDoc: string;
  hashContrato: string;
  idSede: number;
  nomDept: string;
  cargo: string;
  persona?: {
    numDoc: string;
    tipoDoc: string;
    nomPers: string;
    correo: string;
    telPers: string;
  };
}

export interface CreateEmpleadoRequest {
  numDoc: string;
  hashContrato?: string;
  idSede: number;
  nomDept: string;
  cargo: string;
}

export interface UpdateEmpleadoRequest {
  hashContrato?: string;
  idSede?: number;
  nomDept?: string;
  cargo?: string;
}
