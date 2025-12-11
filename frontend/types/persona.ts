export interface Persona {
  numDoc: string;
  tipoDoc: string;
  nomPers: string;
  correo: string;
  telPers: string;
  idSedeRegistro: number;
  fechaCreacion?: string;
  ultimaModificacion?: string;
}

export interface CreatePersonaRequest {
  numDoc: string;
  tipoDoc: string;
  nomPers: string;
  correo?: string;
  telPers?: string;
  idSedeRegistro: number;
}

export interface UpdatePersonaRequest {
  tipoDoc?: string;
  nomPers?: string;
  correo?: string;
  telPers?: string;
}
