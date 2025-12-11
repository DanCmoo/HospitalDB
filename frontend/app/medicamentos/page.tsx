'use client';

import { useState, useEffect } from 'react';
import { Medicamento } from '@/types/medicamento';
import { medicamentosApi } from '@/lib/api/medicamentos';
import MedicamentoForm from '@/components/medicamentos/MedicamentoForm';
import MedicamentoTable from '@/components/medicamentos/MedicamentoTable';
import StockModal from '@/components/medicamentos/StockModal';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

function MedicamentosContent() {
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [filteredMedicamentos, setFilteredMedicamentos] = useState<Medicamento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedMedicamento, setSelectedMedicamento] = useState<Medicamento | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'bajo' | 'agotado'>('all');

  useEffect(() => {
    loadMedicamentos();
  }, []);

  useEffect(() => {
    filterMedicamentos();
  }, [medicamentos, searchTerm, stockFilter]);

  const loadMedicamentos = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await medicamentosApi.getAll();
      setMedicamentos(Array.isArray(data) ? data : []);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al cargar medicamentos');
      setMedicamentos([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterMedicamentos = () => {
    let filtered = [...(medicamentos || [])];

    // Filtro por stock
    if (stockFilter === 'bajo') {
      filtered = filtered.filter((m) => m.stock > 0 && m.stock <= 10);
    } else if (stockFilter === 'agotado') {
      filtered = filtered.filter((m) => m.stock === 0);
    }

    // Búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.nomMed.toLowerCase().includes(term) ||
          m.proveedor?.toLowerCase().includes(term) ||
          m.descripcion?.toLowerCase().includes(term),
      );
    }

    setFilteredMedicamentos(filtered);
  };

  const handleCreate = () => {
    setSelectedMedicamento(undefined);
    setShowForm(true);
  };

  const handleEdit = (medicamento: Medicamento) => {
    setSelectedMedicamento(medicamento);
    setShowForm(true);
  };

  const handleUpdateStock = (medicamento: Medicamento) => {
    setSelectedMedicamento(medicamento);
    setShowStockModal(true);
  };

  const handleDelete = async (codigo: number) => {
    if (!confirm('¿Está seguro de eliminar este medicamento?')) return;

    try {
      await medicamentosApi.delete(codigo);
      await loadMedicamentos();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al eliminar medicamento');
    }
  };

  const handleFormSuccess = async () => {
    setShowForm(false);
    setSelectedMedicamento(undefined);
    await loadMedicamentos();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setSelectedMedicamento(undefined);
  };

  const handleStockSuccess = async () => {
    setShowStockModal(false);
    setSelectedMedicamento(undefined);
    await loadMedicamentos();
  };

  const handleStockCancel = () => {
    setShowStockModal(false);
    setSelectedMedicamento(undefined);
  };

  const stockBajoCount = (medicamentos || []).filter((m) => m.stock > 0 && m.stock <= 10).length;
  const stockAgotadoCount = (medicamentos || []).filter((m) => m.stock === 0).length;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Cargando medicamentos...</div>
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
        <h1 className="text-3xl font-bold text-white">Gestión de Medicamentos</h1>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Nuevo Medicamento
        </button>
      </div>

      {/* Alertas de stock */}
      {(stockBajoCount > 0 || stockAgotadoCount > 0) && (
        <div className="mb-6 space-y-2">
          {stockAgotadoCount > 0 && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              ⚠️ {stockAgotadoCount} medicamento(s) agotado(s)
            </div>
          )}
          {stockBajoCount > 0 && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
              ⚠️ {stockBajoCount} medicamento(s) con stock bajo (≤10)
            </div>
          )}
        </div>
      )}

      {showForm && (
        <div className="bg-gray-800 p-6 rounded-lg shadow-2xl border border-gray-700 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-white">
            {selectedMedicamento ? 'Editar Medicamento' : 'Nuevo Medicamento'}
          </h2>
          <MedicamentoForm
            medicamento={selectedMedicamento}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </div>
      )}

      {showStockModal && selectedMedicamento && (
        <StockModal
          medicamento={selectedMedicamento}
          onSuccess={handleStockSuccess}
          onCancel={handleStockCancel}
        />
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
              placeholder="Buscar por nombre, proveedor o descripción..."
              className="w-full px-3 py-2 border border-gray-600 bg-gray-900 text-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Filtrar por Stock
            </label>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as 'all' | 'bajo' | 'agotado')}
              className="w-full px-3 py-2 border border-gray-600 bg-gray-900 text-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos</option>
              <option value="bajo">Stock Bajo (≤10)</option>
              <option value="agotado">Agotados</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-2xl border border-gray-700">
        <MedicamentoTable
          medicamentos={filteredMedicamentos}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onUpdateStock={handleUpdateStock}
        />
      </div>

      <div className="mt-4 text-sm text-gray-300">
        Total de medicamentos: {filteredMedicamentos.length} de {medicamentos.length}
      </div>
    </div>
  );
}

export default function MedicamentosPage() {
  return (
    <ProtectedRoute allowedRoles={['administrador', 'medico', 'enfermero', 'personal_administrativo']}>
      <MedicamentosContent />
    </ProtectedRoute>
  );
}
