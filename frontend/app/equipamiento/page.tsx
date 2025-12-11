'use client';

import { useState, useEffect } from 'react';
import { Equipamiento, EstadoEquipamiento } from '@/types/equipamiento';
import { equipamientoApi } from '@/lib/api/equipamiento';
import EquipamientoForm from '@/components/equipamiento/EquipamientoForm';
import EquipamientoTable from '@/components/equipamiento/EquipamientoTable';

export default function EquipamientoPage() {
  const [equipamientos, setEquipamientos] = useState<Equipamiento[]>([]);
  const [filteredEquipamientos, setFilteredEquipamientos] = useState<Equipamiento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedEquipamiento, setSelectedEquipamiento] = useState<Equipamiento | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');

  useEffect(() => {
    loadEquipamientos();
  }, []);

  useEffect(() => {
    filterEquipamientos();
  }, [equipamientos, searchTerm, estadoFilter]);

  const loadEquipamientos = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await equipamientoApi.getAll();
      setEquipamientos(data);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al cargar equipamiento');
    } finally {
      setIsLoading(false);
    }
  };

  const filterEquipamientos = () => {
    let filtered = [...equipamientos];

    if (estadoFilter) {
      filtered = filtered.filter((e) => e.estado === estadoFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.nomEq.toLowerCase().includes(term) ||
          e.empleado?.persona?.nomPers.toLowerCase().includes(term) ||
          e.departamentos?.some((d) => d.nomDept.toLowerCase().includes(term)),
      );
    }

    setFilteredEquipamientos(filtered);
  };

  const handleCreate = () => {
    setSelectedEquipamiento(undefined);
    setShowForm(true);
  };

  const handleEdit = (equipamiento: Equipamiento) => {
    setSelectedEquipamiento(equipamiento);
    setShowForm(true);
  };

  const handleDelete = async (codigo: number) => {
    if (!confirm('¿Está seguro de eliminar este equipamiento?')) return;

    try {
      await equipamientoApi.delete(codigo);
      await loadEquipamientos();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al eliminar equipamiento');
    }
  };

  const handleFormSuccess = async () => {
    setShowForm(false);
    setSelectedEquipamiento(undefined);
    await loadEquipamientos();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setSelectedEquipamiento(undefined);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Cargando equipamiento...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Gestión de Equipamiento</h1>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Nuevo Equipamiento
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-800 p-6 rounded-lg shadow-2xl border border-gray-700 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-white">
            {selectedEquipamiento ? 'Editar Equipamiento' : 'Nuevo Equipamiento'}
          </h2>
          <EquipamientoForm
            equipamiento={selectedEquipamiento}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </div>
      )}

      <div className="bg-gray-800 p-6 rounded-lg shadow-2xl border border-gray-700 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Buscar
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, responsable o departamento..."
              className="w-full px-3 py-2 border border-gray-600 bg-gray-900 text-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Filtrar por Estado
            </label>
            <select
              value={estadoFilter}
              onChange={(e) => setEstadoFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-600 bg-gray-900 text-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos</option>
              <option value={EstadoEquipamiento.OPERATIVO}>Operativo</option>
              <option value={EstadoEquipamiento.EN_MANTENIMIENTO}>En Mantenimiento</option>
              <option value={EstadoEquipamiento.FUERA_DE_SERVICIO}>Fuera de Servicio</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-2xl border border-gray-700">
        <EquipamientoTable
          equipamientos={filteredEquipamientos}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <div className="mt-4 text-sm text-gray-300">
        Total de equipamiento: {filteredEquipamientos.length} de {equipamientos.length}
      </div>
    </div>
  );
}
