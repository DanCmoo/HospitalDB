export interface Medicamento {
  codMed: number;
  nomMed: string;
  stock: number;
  proveedor?: string;
  descripcion?: string;
  idSede: number;
}

export interface CreateMedicamentoDto {
  codMed: number;
  nomMed: string;
  stock: number;
  proveedor?: string;
  descripcion?: string;
  idSede: number;
}

export interface UpdateMedicamentoDto {
  nomMed?: string;
  stock?: number;
  proveedor?: string;
  descripcion?: string;
}

export interface UpdateStockDto {
  cantidad: number;
}
