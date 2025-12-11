export class PerteneceResponseDto {
  nomDept: string;
  codEq: number;
  departamento?: {
    nomDept: string;
    idSede: number;
    sede?: any;
  };
  equipamiento?: {
    codEq: number;
    nomEq: string;
    estado: string;
    fechaMant: Date;
    idEmp: number;
    empleado?: any;
  };
}
