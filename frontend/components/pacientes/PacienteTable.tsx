'use client';

import { Paciente } from '@/types/paciente';

interface PacienteTableProps {
  pacientes: Paciente[];
  onEdit: (paciente: Paciente) => void;
  onDelete: (codigo: number) => void;
}

export default function PacienteTable({ pacientes, onEdit, onDelete }: PacienteTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Código
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Documento
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nombre
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Edad
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Género
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Dirección
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {pacientes.map((paciente) => (
            <tr key={paciente.codPac} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {paciente.codPac}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {paciente.numDoc}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {paciente.persona?.nomPers || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {paciente.edad !== undefined ? `${paciente.edad} años` : '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {paciente.genero}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {paciente.drPac || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => onEdit(paciente)}
                  className="text-blue-600 hover:text-blue-900 mr-4"
                >
                  Editar
                </button>
                <button
                  onClick={() => onDelete(paciente.codPac)}
                  className="text-red-600 hover:text-red-900"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {pacientes.length === 0 && (
        <div className="text-center py-8 text-gray-500">No hay pacientes registrados</div>
      )}
    </div>
  );
}
