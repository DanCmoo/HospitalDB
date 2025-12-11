'use client';

import { useState, useEffect } from 'react';
import { Medicamento, CreateMedicamentoDto, UpdateMedicamentoDto } from '@/types/medicamento';
import { medicamentosApi } from '@/lib/api/medicamentos';

interface MedicamentoFormProps {
  medicamento?: Medicamento;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function MedicamentoForm({ medicamento, onSuccess, onCancel }: MedicamentoFormProps) {
  const [formData, setFormData] = useState({
    codMed: 0,
    nomMed: '',
    stock: 0,
    proveedor: '',
    descripcion: '',
    idSede: 1,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (medicamento) {
      setFormData({
        codMed: medicamento.codMed,
        nomMed: medicamento.nomMed,
        stock: medicamento.stock,
        proveedor: medicamento.proveedor || '',
        descripcion: medicamento.descripcion || '',
        idSede: medicamento.idSede || 1,
      });
    } else {
      loadNextCodigo();
    }
  }, [medicamento]);

  const loadNextCodigo = async () => {
    try {
      const nextCodigo = await medicamentosApi.getNextCodigo();
      setFormData((prev) => ({ ...prev, codMed: nextCodigo }));
    } catch (error) {
      console.error('Error loading next codigo:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (medicamento) {
        const updateData: UpdateMedicamentoDto = {
          nomMed: formData.nomMed || undefined,
          stock: formData.stock,
          proveedor: formData.proveedor || undefined,
          descripcion: formData.descripcion || undefined,
        };
        await medicamentosApi.update(medicamento.codMed, updateData);
      } else {
        const createData: CreateMedicamentoDto = {
          codMed: formData.codMed,
          nomMed: formData.nomMed,
          stock: formData.stock,
          proveedor: formData.proveedor || undefined,
          descripcion: formData.descripcion || undefined,
          idSede: formData.idSede,
        };
        await medicamentosApi.create(createData);
      }
      onSuccess();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al guardar medicamento');
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
          value={formData.codMed}
          onChange={(e) => setFormData({ ...formData, codMed: parseInt(e.target.value) })}
          disabled={!!medicamento}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Nombre *</label>
        <input
          type="text"
          value={formData.nomMed}
          onChange={(e) => setFormData({ ...formData, nomMed: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          maxLength={30}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Stock *</label>
        <input
          type="number"
          value={formData.stock}
          onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          min={0}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Proveedor</label>
        <input
          type="text"
          value={formData.proveedor}
          onChange={(e) => setFormData({ ...formData, proveedor: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          maxLength={30}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Descripción</label>
        <textarea
          value={formData.descripcion}
          onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          maxLength={40}
          rows={3}
        />
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
          {isLoading ? 'Guardando...' : medicamento ? 'Actualizar' : 'Crear'}
        </button>
      </div>
    </form>
  );
}
