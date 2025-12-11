'use client';

import { useState, useEffect } from 'react';
import { personasApi } from '@/lib/api/personas';
import { Persona, CreatePersonaRequest, UpdatePersonaRequest } from '@/types/persona';
import PersonaForm from '@/components/personas/PersonaForm';
import PersonaTable from '@/components/personas/PersonaTable';
import ErrorMessage from '@/components/common/ErrorMessage';

export default function PersonasPage() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPersona, setEditingPersona] = useState<Persona | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadPersonas();
  }, []);

  const loadPersonas = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await personasApi.getAll();
      setPersonas(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar personas');
      console.error('Error cargando personas:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (data: CreatePersonaRequest | UpdatePersonaRequest) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      if (editingPersona) {
        await personasApi.update(editingPersona.numDoc, data as UpdatePersonaRequest);
      } else {
        await personasApi.create(data as CreatePersonaRequest);
      }
      
      await loadPersonas();
      setShowForm(false);
      setEditingPersona(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar persona');
      console.error('Error guardando persona:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (persona: Persona) => {
    setEditingPersona(persona);
    setShowForm(true);
    setError(null);
  };

  const handleDelete = async (numDoc: string) => {
    try {
      setError(null);
      await personasApi.delete(numDoc);
      await loadPersonas();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar persona');
      console.error('Error eliminando persona:', err);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingPersona(undefined);
    setError(null);
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadPersonas();
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await personasApi.search(searchTerm);
      setPersonas(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error en la búsqueda');
      console.error('Error buscando personas:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Personas</h1>
          <p className="mt-2 text-sm text-gray-600">
            Administra la información de todas las personas registradas en el sistema
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6">
            <ErrorMessage message={error} onDismiss={() => setError(null)} />
          </div>
        )}

        {/* Form Section */}
        {showForm ? (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {editingPersona ? 'Editar Persona' : 'Nueva Persona'}
            </h2>
            <PersonaForm
              persona={editingPersona}
              onSubmit={handleCreate}
              onCancel={handleCancel}
              isLoading={isSubmitting}
            />
          </div>
        ) : (
          <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Buscar por nombre..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleSearch}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Buscar
                </button>
                {searchTerm && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      loadPersonas();
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Limpiar
                  </button>
                )}
              </div>
            </div>

            {/* Add Button */}
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Nueva Persona
            </button>
          </div>
        )}

        {/* Table Section */}
        <PersonaTable
          personas={personas}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isLoading={isLoading}
        />

        {/* Stats */}
        {!isLoading && !showForm && (
          <div className="mt-4 text-sm text-gray-600">
            Total de personas: <span className="font-semibold">{personas.length}</span>
          </div>
        )}
      </div>
    </div>
  );
}
