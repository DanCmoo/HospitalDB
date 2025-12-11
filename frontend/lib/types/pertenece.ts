import { Departamento } from './departamento';
import { Equipamiento } from './equipamiento';

export interface Pertenece {
  nomDept: string;
  codEq: number;
  departamento?: Departamento;
  equipamiento?: Equipamiento;
}

export interface CreatePerteneceDto {
  nomDept: string;
  codEq: number;
}
