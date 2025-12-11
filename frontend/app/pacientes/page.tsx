'use client';

import { useState, useEffect } from 'react';
import { Paciente } from '@/types/paciente';
import { pacientesApi } from '@/lib/api/pacientes';
import PacienteForm from '@/components/pacientes/PacienteForm';
import PacienteTable from '@/components/pacientes/PacienteTable';

export default function PacientesPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [filteredPacientes, setFilteredPacientes] = useState<Paciente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [generoFilter, setGeneroFilter] = useState('');

  useEffect(() => {
    loadPacientes();
  }, []);

  useEffect(() => {
    filterPacientes();
  }, [pacientes, searchTerm, generoFilter]);

  const loadPacientes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await pacientesApi.getAll();
      setPacientes(data);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al cargar pacientes');
    } finally {
      setIsLoading(false);
    }
  };

  const filterPacientes = () => {
    let filtered = [...pacientes];

    if (generoFilter) {
      filtered = filtered.filter((p) => p.genero === generoFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.numDoc.toLowerCase().includes(term) ||
          p.persona?.nomPers.toLowerCase().includes(term) ||
          p.drPac?.toLowerCase().includes(term),
      );
    }

    setFilteredPacientes(filtered);
  };

  const handleCreate = () => {
    setSelectedPaciente(undefined);
    setShowForm(true);
  };

  const handleEdit = (paciente: Paciente) => {
    setSelectedPaciente(paciente);
    setShowForm(true);
  };

  const handleDelete = async (codigo: number) => {
    if (!confirm('¿Está seguro de eliminar este paciente?')) return;

    try {
      await pacientesApi.delete(codigo);
      await loadPacientes();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al eliminar paciente');
    }
  };

  const handleFormSuccess = async () => {
    setShowForm(false);
    setSelectedPaciente(undefined);
    await loadPacientes();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setSelectedPaciente(undefined);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Cargando pacientes...</div>
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
        <h1 className="text-3xl font-bold">Gestión de Pacientes</h1>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Nuevo Paciente
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {selectedPaciente ? 'Editar Paciente' : 'Nuevo Paciente'}
          </h2>
          <PacienteForm
            paciente={selectedPaciente}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por documento, nombre o dirección..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrar por Género
            </label>
            <select
              value={generoFilter}
              onChange={(e) => setGeneroFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos</option>
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <PacienteTable
          pacientes={filteredPacientes}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <div className="mt-4 text-sm text-gray-600">
        Total de pacientes: {filteredPacientes.length} de {pacientes.length}
      </div>
    </div>
  );
}
