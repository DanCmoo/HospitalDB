export interface Prescribe {
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

export interface CreatePrescribeDto {
  codMed: number;
  idCita: number;
  dosis: number;
  frecuencia: number;
  duracion: string;
  fechaEmision: string;
}

export interface UpdatePrescribeDto {
  dosis?: number;
  frecuencia?: number;
  duracion?: string;
  fechaEmision?: string;
}
