export class EquipamientoResponseDto {
  codEq: number;
  nomEq: string;
  estado: string;
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
