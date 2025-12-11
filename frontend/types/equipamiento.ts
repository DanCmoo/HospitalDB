export enum EstadoEquipamiento {
  OPERATIVO = 'Operativo',
  EN_MANTENIMIENTO = 'En Mantenimiento',
  FUERA_DE_SERVICIO = 'Fuera de Servicio',
}

export interface Equipamiento {
  codEq: number;
  nomEq: string;
  estado: EstadoEquipamiento;
  fechaMant?: string;
  idEmp: number;
  empleado?: {
    idEmp: number;
    numDoc: string;
    cargo: string;
    persona?: {
      numDoc: string;
      nomPers: string;
      correo: string;
      telPers: string;
    };
  };
  departamentos?: {
    nomDept: string;
    idSede: number;
  }[];
}

export interface CreateEquipamientoDto {
  codEq: number;
  nomEq: string;
  estado: EstadoEquipamiento;
  fechaMant?: string;
  idEmp: number;
  departamentos?: string[];
}

export interface UpdateEquipamientoDto {
  nomEq?: string;
  estado?: EstadoEquipamiento;
  fechaMant?: string;
  departamentos?: string[];
}
