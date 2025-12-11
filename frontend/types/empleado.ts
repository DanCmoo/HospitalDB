export interface Empleado {
  idEmp: number;
  idSede: number;
  numDoc: string;
  hashContrato: string;
  nomDept: string;
  cargo: string;
  activo?: boolean;
  fechaContratacion?: string;
  persona?: {
    numDoc: string;
    tipoDoc: string;
    nomPers: string;
    correo: string;
    telPers: string;
  };
}

export interface CreateEmpleadoRequest {
  idEmp: number;
  idSede: number;
  numDoc: string;
  hashContrato?: string;
  nomDept: string;
  cargo: string;
  activo?: boolean;
}

export interface UpdateEmpleadoRequest {
  hashContrato?: string;
  nomDept?: string;
  cargo?: string;
  activo?: boolean;
}
