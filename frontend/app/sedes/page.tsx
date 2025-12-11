'use client';

import { useState, useEffect } from 'react';
import { sedesApi } from '@/lib/api/sedes';
import { Sede, CreateSedeRequest, UpdateSedeRequest } from '@/types/sede';
import SedeForm from '@/components/sedes/SedeForm';
import SedeTable from '@/components/sedes/SedeTable';
import ErrorMessage from '@/components/common/ErrorMessage';

export default function SedesPage() {
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingSede, setEditingSede] = useState<Sede | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCiudad, setFilterCiudad] = useState('');

  useEffect(() => {
    loadSedes();
  }, []);

  const loadSedes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await sedesApi.getAll();
      setSedes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar sedes');
      console.error('Error cargando sedes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (data: CreateSedeRequest | UpdateSedeRequest) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      if (editingSede) {
        await sedesApi.update(editingSede.idSede, data as UpdateSedeRequest);
      } else {
        await sedesApi.create(data as CreateSedeRequest);
      }
      
      await loadSedes();
      setShowForm(false);
      setEditingSede(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar sede');
      console.error('Error guardando sede:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (sede: Sede) => {
    setEditingSede(sede);
    setShowForm(true);
    setError(null);
  };

  const handleDelete = async (id: number) => {
    try {
      setError(null);
      await sedesApi.delete(id);
      await loadSedes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar sede');
      console.error('Error eliminando sede:', err);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingSede(undefined);
    setError(null);
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadSedes();
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await sedesApi.search(searchTerm);
      setSedes(data);
      setFilterCiudad('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error en la búsqueda');
      console.error('Error buscando sedes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterByCiudad = async () => {
    if (!filterCiudad.trim()) {
      loadSedes();
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await sedesApi.getByCiudad(filterCiudad);
      setSedes(data);
      setSearchTerm('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al filtrar por ciudad');
      console.error('Error filtrando por ciudad:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterCiudad('');
    loadSedes();
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Gestión de Sedes Hospitalarias</h1>
          <p className="mt-2 text-sm text-gray-300">
            Administra las sedes hospitalarias del sistema
          </p>
        </div>

        {error && (
          <div className="mb-6">
            <ErrorMessage message={error} onDismiss={() => setError(null)} />
          </div>
        )}

        {showForm ? (
          <div className="bg-gray-800 rounded-lg shadow-2xl border border-gray-700 p-6 mb-8">
            <h2 className="text-xl font-semibold text-white mb-6">
              {editingSede ? 'Editar Sede' : 'Nueva Sede'}
            </h2>
            <SedeForm
              sede={editingSede}
              onSubmit={handleCreate}
              onCancel={handleCancel}
              isLoading={isSubmitting}
            />
          </div>
        ) : (
          <>
            <div className="mb-6 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="Buscar por nombre o ciudad..."
                      className="flex-1 px-4 py-2 border border-gray-600 bg-gray-900 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleSearch}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Buscar
                    </button>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={filterCiudad}
                      onChange={(e) => setFilterCiudad(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleFilterByCiudad()}
                      placeholder="Filtrar por ciudad..."
                      className="flex-1 px-4 py-2 border border-gray-600 bg-gray-900 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleFilterByCiudad}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Filtrar
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                {(searchTerm || filterCiudad) && (
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Limpiar Filtros
                  </button>
                )}
                <div className="ml-auto">
                  <button
                    onClick={() => setShowForm(true)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Nueva Sede
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        <SedeTable
          sedes={sedes}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isLoading={isLoading}
        />

        {!isLoading && !showForm && (
          <div className="mt-4 text-sm text-gray-300">
            Total de sedes: <span className="font-semibold">{sedes.length}</span>
            {(searchTerm || filterCiudad) && (
              <span className="ml-4 text-blue-600">
                (Filtrado{searchTerm && ` por búsqueda: ${searchTerm}`}
                {filterCiudad && ` por ciudad: ${filterCiudad}`})
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
