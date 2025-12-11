export class PrescribeResponseDto {
  codMed: number;
  idCita: number;
  dosis: number;
  frecuencia: number;
  duracion: string;
  fechaEmision: string;
  medicamento?: {
    codMed: number;
    nomMed: string;
    stock: number;
  };
  cita?: {
    idCita: number;
    fecha: string;
    tipoServicio: string;
    paciente?: {
      codPac: number;
      persona?: {
        nomPers: string;
      };
    };
  };
}
