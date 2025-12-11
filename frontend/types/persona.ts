export interface Persona {
  numDoc: string;
  tipoDoc: string;
  nomPers: string;
  correo: string;
  telPers: string;
}

export interface CreatePersonaRequest {
  numDoc: string;
  tipoDoc: string;
  nomPers: string;
  correo?: string;
  telPers?: string;
}

export interface UpdatePersonaRequest {
  tipoDoc?: string;
  nomPers?: string;
  correo?: string;
  telPers?: string;
}
