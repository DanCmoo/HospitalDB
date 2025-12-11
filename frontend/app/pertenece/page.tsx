'use client';

import { useState, useEffect } from 'react';
import { perteneceApi } from '@/lib/api/pertenece';
import { departamentosApi } from '@/lib/api/departamentos';
import { equipamientoApi } from '@/lib/api/equipamiento';
import { Pertenece, CreatePerteneceDto } from '@/lib/types/pertenece';
import { Departamento } from '@/lib/types/departamento';
import { Equipamiento } from '@/lib/types/equipamiento';

export default function PertenecePage() {
  const [perteneces, setPerteneces] = useState<Pertenece[]>([]);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [equipamientos, setEquipamientos] = useState<Equipamiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departamentoFilter, setDepartamentoFilter] = useState<string>('');
  const [equipamientoFilter, setEquipamientoFilter] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<CreatePerteneceDto>({
    nomDept: '',
    codEq: 0,
  });

  useEffect(() => {
    loadData();
  }, [departamentoFilter, equipamientoFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (departamentoFilter) params.nomDept = departamentoFilter;
      if (equipamientoFilter) params.codEq = parseInt(equipamientoFilter);

      const [pertenecesData, departamentosData, equipamientosData] = await Promise.all([
        perteneceApi.getAll(params),
        departamentosApi.getAll(),
        equipamientoApi.getAll(),
      ]);

      setPerteneces(pertenecesData);
      setDepartamentos(departamentosData);
      setEquipamientos(equipamientosData);
    } catch (error) {
      console.error('Error cargando datos:', error);
      alert('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await perteneceApi.create(formData);
      setShowModal(false);
      resetForm();
      loadData();
    } catch (error: any) {
      console.error('Error creando relación:', error);
      alert(error.response?.data?.message || 'Error al crear la relación. Puede que ya exista.');
    }
  };

  const handleDelete = async (nomDept: string, codEq: number) => {
    if (!confirm('¿Está seguro de eliminar esta asignación de equipamiento?')) return;
    try {
      await perteneceApi.delete(nomDept, codEq);
      loadData();
    } catch (error) {
      console.error('Error eliminando relación:', error);
      alert('Error al eliminar la relación');
    }
  };

  const resetForm = () => {
    setFormData({
      nomDept: '',
      codEq: 0,
    });
  };

  const filteredPerteneces = perteneces.filter((per) => {
    const matchesSearch =
      per.departamento?.nomDept.toLowerCase().includes(searchTerm.toLowerCase()) ||
      per.equipamiento?.nomEq.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getEstadoColor = (estado: string) => {
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

  // Agrupar por departamento para vista mejorada
  const departamentosConEquipamiento = departamentos.map((dept) => ({
    ...dept,
    equipamientos: perteneces
      .filter((p) => p.nomDept === dept.nomDept)
      .map((p) => p.equipamiento)
      .filter((eq): eq is Equipamiento => eq !== undefined),
  }));

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Cargando...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Asignación de Equipamiento a Departamentos</h1>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Nueva Asignación
        </button>
      </div>

      <div className="mb-4 flex gap-4">
        <input
          type="text"
          placeholder="Buscar por departamento o equipamiento..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-600 bg-gray-900 text-white rounded"
        />
        <select
          value={departamentoFilter}
          onChange={(e) => setDepartamentoFilter(e.target.value)}
          className="px-4 py-2 border border-gray-600 bg-gray-900 text-white rounded"
        >
          <option value="">Todos los departamentos</option>
          {departamentos.map((dept) => (
            <option key={dept.nomDept} value={dept.nomDept}>
              {dept.nomDept}
            </option>
          ))}
        </select>
        <select
          value={equipamientoFilter}
          onChange={(e) => setEquipamientoFilter(e.target.value)}
          className="px-4 py-2 border border-gray-600 bg-gray-900 text-white rounded"
        >
          <option value="">Todos los equipamientos</option>
          {equipamientos.map((eq) => (
            <option key={eq.codEq} value={eq.codEq}>
              {eq.nomEq}
            </option>
          ))}
        </select>
      </div>

      {/* Vista de tabla completa */}
      <div className="bg-gray-800 rounded-lg shadow-2xl border border-gray-700 overflow-hidden mb-8">
        <h2 className="text-xl font-semibold p-4 bg-gray-800 text-white">Vista de Tabla</h2>
        <table className="min-w-full">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Departamento</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Sede</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Equipamiento</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Responsable</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {filteredPerteneces.map((per) => (
              <tr key={`${per.nomDept}-${per.codEq}`} className="hover:bg-gray-700">
                <td className="px-6 py-4 text-sm font-medium text-white">{per.departamento?.nomDept || 'N/A'}</td>
                <td className="px-6 py-4 text-sm text-white">{per.departamento?.sede?.nomSede || 'N/A'}</td>
                <td className="px-6 py-4 text-sm text-white">{per.equipamiento?.nomEq || 'N/A'}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded ${getEstadoColor(per.equipamiento?.estado || '')}`}>
                    {per.equipamiento?.estado || 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-white">
                  {per.equipamiento?.empleado?.persona?.nomPers || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => handleDelete(per.nomDept, per.codEq)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Vista agrupada por departamento */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departamentosConEquipamiento
          .filter((dept) => !departamentoFilter || dept.nomDept === departamentoFilter)
          .map((dept) => (
            <div key={dept.nomDept} className="bg-gray-800 rounded-lg shadow-2xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold mb-2 text-white">{dept.nomDept}</h3>
              <p className="text-sm text-gray-300 mb-4">
                Sede: {dept.sede?.nomSede || 'N/A'}
              </p>
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-300">
                  Equipamiento ({dept.equipamientos.length})
                </h4>
                {dept.equipamientos.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">Sin equipamiento asignado</p>
                ) : (
                  <ul className="space-y-1">
                    {dept.equipamientos.map((eq) => (
                      <li key={eq.codEq} className="text-sm flex items-center justify-between text-white">
                        <span>{eq.nomEq}</span>
                        <span className={`px-2 py-1 text-xs rounded ${getEstadoColor(eq.estado)}`}>
                          {eq.estado}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-white">Nueva Asignación</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Departamento</label>
                <select
                  value={formData.nomDept}
                  onChange={(e) => setFormData({ ...formData, nomDept: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-600 bg-gray-900 text-white rounded"
                  required
                >
                  <option value="">Seleccione un departamento</option>
                  {departamentos.map((dept) => (
                    <option key={dept.nomDept} value={dept.nomDept}>
                      {dept.nomDept} - {dept.sede?.nomSede}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Equipamiento</label>
                <select
                  value={formData.codEq}
                  onChange={(e) => setFormData({ ...formData, codEq: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-600 bg-gray-900 text-white rounded"
                  required
                >
                  <option value={0}>Seleccione un equipamiento</option>
                  {equipamientos.map((eq) => (
                    <option key={eq.codEq} value={eq.codEq}>
                      {eq.nomEq} - {eq.estado}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-600 rounded hover:bg-gray-700 text-gray-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreate}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  disabled={!formData.nomDept || !formData.codEq}
                >
                  Asignar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
