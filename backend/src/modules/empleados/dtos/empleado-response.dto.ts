export class EmpleadoResponseDto {
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
