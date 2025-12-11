'use client';

import { useState, useEffect } from 'react';
import { Equipamiento, CreateEquipamientoDto, UpdateEquipamientoDto, EstadoEquipamiento } from '@/types/equipamiento';
import { equipamientoApi } from '@/lib/api/equipamiento';
import { empleadosApi } from '@/lib/api/empleados';
import { departamentosApi } from '@/lib/api/departamentos';

interface EquipamientoFormProps {
  equipamiento?: Equipamiento;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function EquipamientoForm({ equipamiento, onSuccess, onCancel }: EquipamientoFormProps) {
  const [formData, setFormData] = useState({
    codEq: 0,
    nomEq: '',
    estado: '' as EstadoEquipamiento,
    fechaMant: '',
    idEmp: 0,
    departamentos: [] as string[],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [empleados, setEmpleados] = useState<any[]>([]);
  const [departamentos, setDepartamentos] = useState<any[]>([]);

  useEffect(() => {
    loadData();
    if (equipamiento) {
      setFormData({
        codEq: equipamiento.codEq,
        nomEq: equipamiento.nomEq,
        estado: equipamiento.estado,
        fechaMant: equipamiento.fechaMant || '',
        idEmp: equipamiento.idEmp,
        departamentos: equipamiento.departamentos?.map((d) => d.nomDept) || [],
      });
    } else {
      loadNextCodigo();
    }
  }, [equipamiento]);

  const loadData = async () => {
    try {
      const [emps, depts] = await Promise.all([
        empleadosApi.getAll(),
        departamentosApi.getAll(),
      ]);
      setEmpleados(emps);
      setDepartamentos(depts);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadNextCodigo = async () => {
    try {
      const nextCodigo = await equipamientoApi.getNextCodigo();
      setFormData((prev) => ({ ...prev, codEq: nextCodigo }));
    } catch (error) {
      console.error('Error loading next codigo:', error);
    }
  };

  const handleDepartamentoToggle = (nomDept: string) => {
    setFormData((prev) => ({
      ...prev,
      departamentos: prev.departamentos.includes(nomDept)
        ? prev.departamentos.filter((d) => d !== nomDept)
        : [...prev.departamentos, nomDept],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (equipamiento) {
        const updateData: UpdateEquipamientoDto = {
          nomEq: formData.nomEq || undefined,
          estado: formData.estado || undefined,
          fechaMant: formData.fechaMant || undefined,
          departamentos: formData.departamentos,
        };
        await equipamientoApi.update(equipamiento.codEq, updateData);
      } else {
        const createData: CreateEquipamientoDto = {
          codEq: formData.codEq,
          nomEq: formData.nomEq,
          estado: formData.estado,
          fechaMant: formData.fechaMant || undefined,
          idEmp: formData.idEmp,
          departamentos: formData.departamentos,
        };
        await equipamientoApi.create(createData);
      }
      onSuccess();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al guardar equipamiento');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Código</label>
        <input
          type="number"
          value={formData.codEq}
          onChange={(e) => setFormData({ ...formData, codEq: parseInt(e.target.value) })}
          disabled={!!equipamiento}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Nombre *</label>
        <input
          type="text"
          value={formData.nomEq}
          onChange={(e) => setFormData({ ...formData, nomEq: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          maxLength={50}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Estado *</label>
        <select
          value={formData.estado}
          onChange={(e) => setFormData({ ...formData, estado: e.target.value as EstadoEquipamiento })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        >
          <option value="">Seleccione...</option>
          <option value={EstadoEquipamiento.OPERATIVO}>Operativo</option>
          <option value={EstadoEquipamiento.EN_MANTENIMIENTO}>En Mantenimiento</option>
          <option value={EstadoEquipamiento.FUERA_DE_SERVICIO}>Fuera de Servicio</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Fecha de Mantenimiento</label>
        <input
          type="date"
          value={formData.fechaMant}
          onChange={(e) => setFormData({ ...formData, fechaMant: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      {!equipamiento && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Empleado Responsable *</label>
          <select
            value={formData.idEmp}
            onChange={(e) => setFormData({ ...formData, idEmp: parseInt(e.target.value) })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            <option value={0}>Seleccione...</option>
            {empleados.map((emp) => (
              <option key={emp.idEmp} value={emp.idEmp}>
                {emp.persona?.nomPers} - {emp.cargo}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Departamentos</label>
        <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-300 rounded-md p-3">
          {departamentos.map((dept) => (
            <label key={dept.nomDept} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.departamentos.includes(dept.nomDept)}
                onChange={() => handleDepartamentoToggle(dept.nomDept)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm">{dept.nomDept}</span>
            </label>
          ))}
        </div>
      </div>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          disabled={isLoading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
          disabled={isLoading}
        >
          {isLoading ? 'Guardando...' : equipamiento ? 'Actualizar' : 'Crear'}
        </button>
      </div>
    </form>
  );
}
