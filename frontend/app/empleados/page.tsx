'use client';

import { useState, useEffect } from 'react';
import { empleadosApi } from '@/lib/api/empleados';
import { Empleado, CreateEmpleadoRequest, UpdateEmpleadoRequest } from '@/types/empleado';
import EmpleadoForm from '@/components/empleados/EmpleadoForm';
import EmpleadoTable from '@/components/empleados/EmpleadoTable';
import ErrorMessage from '@/components/common/ErrorMessage';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

function EmpleadosContent() {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingEmpleado, setEditingEmpleado] = useState<Empleado | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterCargo, setFilterCargo] = useState('');
  const [filterDepartamento, setFilterDepartamento] = useState('');

  useEffect(() => {
    loadEmpleados();
  }, []);

  const loadEmpleados = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await empleadosApi.getAll();
      setEmpleados(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar empleados');
      console.error('Error cargando empleados:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (data: CreateEmpleadoRequest | UpdateEmpleadoRequest) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      if (editingEmpleado) {
        await empleadosApi.update(editingEmpleado.idEmp, data as UpdateEmpleadoRequest);
      } else {
        await empleadosApi.create(data as CreateEmpleadoRequest);
      }
      
      await loadEmpleados();
      setShowForm(false);
      setEditingEmpleado(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar empleado');
      console.error('Error guardando empleado:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (empleado: Empleado) => {
    setEditingEmpleado(empleado);
    setShowForm(true);
    setError(null);
  };

  const handleDelete = async (id: number) => {
    try {
      setError(null);
      await empleadosApi.delete(id);
      await loadEmpleados();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar empleado');
      console.error('Error eliminando empleado:', err);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingEmpleado(undefined);
    setError(null);
  };

  const handleFilterByCargo = async () => {
    if (!filterCargo.trim()) {
      loadEmpleados();
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await empleadosApi.getByCargo(filterCargo);
      setEmpleados(data);
      setFilterDepartamento('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al filtrar por cargo');
      console.error('Error filtrando por cargo:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterByDepartamento = async () => {
    if (!filterDepartamento.trim()) {
      loadEmpleados();
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await empleadosApi.getByDepartamento(filterDepartamento);
      setEmpleados(data);
      setFilterCargo('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al filtrar por departamento');
      console.error('Error filtrando por departamento:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearFilters = () => {
    setFilterCargo('');
    setFilterDepartamento('');
    loadEmpleados();
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Gestión de Empleados</h1>
          <p className="mt-2 text-sm text-gray-300">
            Administra la información de todos los empleados del hospital
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
          <div className="bg-gray-800 rounded-lg shadow-2xl border border-gray-700 p-6 mb-8">
            <h2 className="text-xl font-semibold text-white mb-6">
              {editingEmpleado ? 'Editar Empleado' : 'Nuevo Empleado'}
            </h2>
            <EmpleadoForm
              empleado={editingEmpleado}
              onSubmit={handleCreate}
              onCancel={handleCancel}
              isLoading={isSubmitting}
            />
          </div>
        ) : (
          <>
            {/* Filters and Add Button */}
            <div className="mb-6 space-y-4">
              {/* Filters Row */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={filterCargo}
                      onChange={(e) => setFilterCargo(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleFilterByCargo()}
                      placeholder="Filtrar por cargo..."
                      className="flex-1 px-4 py-2 border border-gray-600 bg-gray-900 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleFilterByCargo}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Filtrar
                    </button>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={filterDepartamento}
                      onChange={(e) => setFilterDepartamento(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleFilterByDepartamento()}
                      placeholder="Filtrar por departamento..."
                      className="flex-1 px-4 py-2 border border-gray-600 bg-gray-900 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleFilterByDepartamento}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Filtrar
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex justify-between items-center">
                {(filterCargo || filterDepartamento) && (
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
                    Nuevo Empleado
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Table Section */}
        <EmpleadoTable
          empleados={empleados}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isLoading={isLoading}
        />

        {/* Stats */}
        {!isLoading && !showForm && (
          <div className="mt-4 text-sm text-gray-300">
            Total de empleados: <span className="font-semibold">{empleados.length}</span>
            {(filterCargo || filterDepartamento) && (
              <span className="ml-4 text-blue-600">
                (Filtrado{filterCargo && ` por cargo: ${filterCargo}`}
                {filterDepartamento && ` por departamento: ${filterDepartamento}`})
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function EmpleadosPage() {
  return (
    <ProtectedRoute allowedRoles={['administrador', 'medico', 'enfermero', 'personal_administrativo']}>
      <EmpleadosContent />
    </ProtectedRoute>
  );
}
