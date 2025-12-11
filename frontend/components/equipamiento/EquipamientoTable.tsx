'use client';

import { Equipamiento } from '@/types/equipamiento';

interface EquipamientoTableProps {
  equipamientos: Equipamiento[];
  onEdit: (equipamiento: Equipamiento) => void;
  onDelete: (codigo: number) => void;
}

export default function EquipamientoTable({ equipamientos, onEdit, onDelete }: EquipamientoTableProps) {
  const getEstadoBadgeColor = (estado: string) => {
    switch (estado) {
      case 'Operativo':
        return 'bg-green-100 text-green-800';
      case 'En Mantenimiento':
        return 'bg-yellow-100 text-yellow-800';
      case 'Fuera de Servicio':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
              Estado
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fecha Mant.
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Responsable
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Departamentos
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {equipamientos.map((equipamiento) => (
            <tr key={equipamiento.codEq} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {equipamiento.codEq}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {equipamiento.nomEq}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoBadgeColor(equipamiento.estado)}`}>
                  {equipamiento.estado}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {equipamiento.fechaMant || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {equipamiento.empleado?.persona?.nomPers || '-'}
                <br />
                <span className="text-xs text-gray-500">{equipamiento.empleado?.cargo}</span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {equipamiento.departamentos && equipamiento.departamentos.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {equipamiento.departamentos.map((dept) => (
                      <span
                        key={dept.nomDept}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                      >
                        {dept.nomDept}
                      </span>
                    ))}
                  </div>
                ) : (
                  '-'
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => onEdit(equipamiento)}
                  className="text-blue-600 hover:text-blue-900 mr-4"
                >
                  Editar
                </button>
                <button
                  onClick={() => onDelete(equipamiento.codEq)}
                  className="text-red-600 hover:text-red-900"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {equipamientos.length === 0 && (
        <div className="text-center py-8 text-gray-500">No hay equipamiento registrado</div>
      )}
    </div>
  );
}
