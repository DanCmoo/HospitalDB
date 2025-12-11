'use client';

import { Medicamento } from '@/types/medicamento';

interface MedicamentoTableProps {
  medicamentos: Medicamento[];
  onEdit: (medicamento: Medicamento) => void;
  onDelete: (codigo: number) => void;
  onUpdateStock: (medicamento: Medicamento) => void;
}

export default function MedicamentoTable({ medicamentos, onEdit, onDelete, onUpdateStock }: MedicamentoTableProps) {
  const getStockColor = (stock: number) => {
    if (stock === 0) return 'text-red-600 font-bold';
    if (stock <= 10) return 'text-yellow-600 font-semibold';
    return 'text-green-600';
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Código
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nombre
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Stock
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Proveedor
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Descripción
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {medicamentos.map((medicamento) => (
            <tr key={medicamento.codMed} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {medicamento.codMed}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {medicamento.nomMed}
              </td>
              <td className={`px-6 py-4 whitespace-nowrap text-sm ${getStockColor(medicamento.stock)}`}>
                {medicamento.stock}
                {medicamento.stock === 0 && ' (Agotado)'}
                {medicamento.stock > 0 && medicamento.stock <= 10 && ' (Bajo)'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {medicamento.proveedor || '-'}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {medicamento.descripcion || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => onUpdateStock(medicamento)}
                  className="text-green-600 hover:text-green-900 mr-3"
                  title="Actualizar Stock"
                >
                  Stock
                </button>
                <button
                  onClick={() => onEdit(medicamento)}
                  className="text-blue-600 hover:text-blue-900 mr-3"
                >
                  Editar
                </button>
                <button
                  onClick={() => onDelete(medicamento.codMed)}
                  className="text-red-600 hover:text-red-900"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {medicamentos.length === 0 && (
        <div className="text-center py-8 text-gray-500">No hay medicamentos registrados</div>
      )}
    </div>
  );
}
