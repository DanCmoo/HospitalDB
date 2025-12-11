export class AgendaCitaResponseDto {
  idCita: number;
  fecha: string;
  hora: string;
  tipoServicio: string;
  estado: string;
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
  prescripciones?: {
    codMed: number;
    dosis: number;
    frecuencia: number;
    duracion: string;
    fechaEmision: string;
    medicamento?: {
      nomMed: string;
    };
  }[];
}
