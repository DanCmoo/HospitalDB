'use client';

import { useState, useEffect } from 'react';
import { Sede, CreateSedeRequest, UpdateSedeRequest } from '@/types/sede';
import { sedesApi } from '@/lib/api/sedes';

interface SedeFormProps {
  sede?: Sede;
  onSubmit: (data: CreateSedeRequest | UpdateSedeRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function SedeForm({ sede, onSubmit, onCancel, isLoading }: SedeFormProps) {
  const isEditing = !!sede;
  const [nextId, setNextId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    idSede: sede?.idSede?.toString() || '',
    telefono: sede?.telefono || '',
    direccion: sede?.direccion || '',
    nomSede: sede?.nomSede || '',
    ciudad: sede?.ciudad || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isEditing) {
      loadNextId();
    }
  }, [isEditing]);

  const loadNextId = async () => {
    try {
      const { nextId } = await sedesApi.getNextId();
      setNextId(nextId);
      setFormData(prev => ({ ...prev, idSede: nextId.toString() }));
    } catch (error) {
      console.error('Error obteniendo siguiente ID:', error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.idSede) {
      newErrors.idSede = 'El ID de la sede es requerido';
    } else if (parseInt(formData.idSede) < 1) {
      newErrors.idSede = 'El ID debe ser mayor a 0';
    }

    if (!formData.direccion.trim()) {
      newErrors.direccion = 'La dirección es requerida';
    }

    if (!formData.nomSede.trim()) {
      newErrors.nomSede = 'El nombre de la sede es requerido';
    }

    if (!formData.ciudad.trim()) {
      newErrors.ciudad = 'La ciudad es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const submitData = isEditing
      ? {
          telefono: formData.telefono || undefined,
          direccion: formData.direccion,
          nomSede: formData.nomSede,
          ciudad: formData.ciudad,
        }
      : {
          idSede: parseInt(formData.idSede),
          telefono: formData.telefono || undefined,
          direccion: formData.direccion,
          nomSede: formData.nomSede,
          ciudad: formData.ciudad,
        };

    await onSubmit(submitData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="idSede" className="block text-sm font-medium text-gray-700 mb-2">
            ID Sede *
          </label>
          <input
            type="number"
            id="idSede"
            name="idSede"
            value={formData.idSede}
            onChange={handleChange}
            disabled={isEditing || isLoading}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              errors.idSede ? 'border-red-500' : 'border-gray-300'
            } ${isEditing ? 'bg-gray-100' : ''}`}
          />
          {errors.idSede && <p className="mt-1 text-sm text-red-600">{errors.idSede}</p>}
          {!isEditing && nextId && <p className="mt-1 text-xs text-gray-500">Siguiente ID sugerido: {nextId}</p>}
        </div>

        <div>
          <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-2">
            Teléfono
          </label>
          <input
            type="tel"
            id="telefono"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="+57 300 123 4567"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="nomSede" className="block text-sm font-medium text-gray-700 mb-2">
            Nombre de la Sede *
          </label>
          <input
            type="text"
            id="nomSede"
            name="nomSede"
            value={formData.nomSede}
            onChange={handleChange}
            disabled={isLoading}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              errors.nomSede ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Sede Principal"
          />
          {errors.nomSede && <p className="mt-1 text-sm text-red-600">{errors.nomSede}</p>}
        </div>

        <div>
          <label htmlFor="ciudad" className="block text-sm font-medium text-gray-700 mb-2">
            Ciudad *
          </label>
          <input
            type="text"
            id="ciudad"
            name="ciudad"
            value={formData.ciudad}
            onChange={handleChange}
            disabled={isLoading}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              errors.ciudad ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Bogotá"
          />
          {errors.ciudad && <p className="mt-1 text-sm text-red-600">{errors.ciudad}</p>}
        </div>

        <div>
          <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-2">
            Dirección *
          </label>
          <input
            type="text"
            id="direccion"
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
            disabled={isLoading}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              errors.direccion ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Calle 123 #45-67"
          />
          {errors.direccion && <p className="mt-1 text-sm text-red-600">{errors.direccion}</p>}
        </div>
      </div>

      <div className="flex gap-4 justify-end pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
        </button>
      </div>
    </form>
  );
}
