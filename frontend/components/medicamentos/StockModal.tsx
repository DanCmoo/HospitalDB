'use client';

import { useState } from 'react';
import { Medicamento, UpdateStockDto } from '@/types/medicamento';
import { medicamentosApi } from '@/lib/api/medicamentos';

interface StockModalProps {
  medicamento: Medicamento;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function StockModal({ medicamento, onSuccess, onCancel }: StockModalProps) {
  const [cantidad, setCantidad] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const updateData: UpdateStockDto = { cantidad };
      await medicamentosApi.updateStock(medicamento.codMed, updateData);
      onSuccess();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al actualizar stock');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">
          Actualizar Stock - {medicamento.nomMed}
        </h3>
        
        <div className="mb-4 p-3 bg-gray-100 rounded">
          <p className="text-sm text-gray-600">Stock actual: <span className="font-bold">{medicamento.stock}</span></p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cantidad (+ para aumentar, - para disminuir)
            </label>
            <input
              type="number"
              value={cantidad}
              onChange={(e) => setCantidad(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ej: 10 o -5"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Nuevo stock: {medicamento.stock + cantidad}
            </p>
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
              {isLoading ? 'Actualizando...' : 'Actualizar Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
