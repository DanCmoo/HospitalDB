'use client';

import { useState, useEffect } from 'react';
import { Empleado, CreateEmpleadoRequest, UpdateEmpleadoRequest } from '@/types/empleado';
import { personasApi } from '@/lib/api/personas';
import { Persona } from '@/types/persona';

interface EmpleadoFormProps {
  empleado?: Empleado;
  onSubmit: (data: CreateEmpleadoRequest | UpdateEmpleadoRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function EmpleadoForm({ empleado, onSubmit, onCancel, isLoading }: EmpleadoFormProps) {
  const isEditing = !!empleado;
  
  const [formData, setFormData] = useState({
    numDoc: empleado?.numDoc || '',
    hashContrato: empleado?.hashContrato || '',
    idSede: empleado?.idSede?.toString() || '1',
    nomDept: empleado?.nomDept || '',
    cargo: empleado?.cargo || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loadingPersonas, setLoadingPersonas] = useState(false);

  useEffect(() => {
    loadPersonas();
  }, []);

  const loadPersonas = async () => {
    try {
      setLoadingPersonas(true);
      const data = await personasApi.getAll();
      setPersonas(data);
    } catch (error) {
      console.error('Error cargando personas:', error);
    } finally {
      setLoadingPersonas(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.numDoc) {
      newErrors.numDoc = 'Debe seleccionar una persona';
    }

    if (!formData.idSede) {
      newErrors.idSede = 'La sede es requerida';
    }

    if (!formData.nomDept.trim()) {
      newErrors.nomDept = 'El departamento es requerido';
    } else if (formData.nomDept.length > 50) {
      newErrors.nomDept = 'El departamento no puede exceder 50 caracteres';
    }

    if (!formData.cargo.trim()) {
      newErrors.cargo = 'El cargo es requerido';
    } else if (formData.cargo.length > 50) {
      newErrors.cargo = 'El cargo no puede exceder 50 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const submitData = isEditing
      ? {
          hashContrato: formData.hashContrato || undefined,
          idSede: parseInt(formData.idSede),
          nomDept: formData.nomDept,
          cargo: formData.cargo,
        }
      : {
          numDoc: formData.numDoc,
          hashContrato: formData.hashContrato || undefined,
          idSede: parseInt(formData.idSede),
          nomDept: formData.nomDept,
          cargo: formData.cargo,
        };

    await onSubmit(submitData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Persona */}
        <div className="md:col-span-2">
          <label htmlFor="numDoc" className="block text-sm font-medium text-gray-700 mb-2">
            Persona *
          </label>
          {loadingPersonas ? (
            <div className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
              Cargando personas...
            </div>
          ) : (
            <select
              id="numDoc"
              name="numDoc"
              value={formData.numDoc}
              onChange={handleChange}
              disabled={isEditing || isLoading}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.numDoc ? 'border-red-500' : 'border-gray-300'
              } ${isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            >
              <option value="">Seleccione una persona</option>
              {personas.map((persona) => (
                <option key={persona.numDoc} value={persona.numDoc}>
                  {persona.nomPers} - {persona.tipoDoc} {persona.numDoc}
                </option>
              ))}
            </select>
          )}
          {errors.numDoc && <p className="mt-1 text-sm text-red-600">{errors.numDoc}</p>}
          {isEditing && empleado?.persona && (
            <p className="mt-1 text-sm text-gray-500">
              {empleado.persona.nomPers} - {empleado.persona.tipoDoc} {empleado.persona.numDoc}
            </p>
          )}
        </div>

        {/* Hash Contrato */}
        <div className="md:col-span-2">
          <label htmlFor="hashContrato" className="block text-sm font-medium text-gray-700 mb-2">
            Hash de Contrato
          </label>
          <input
            type="text"
            id="hashContrato"
            name="hashContrato"
            value={formData.hashContrato}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Hash del contrato (opcional)"
          />
          <p className="mt-1 text-xs text-gray-500">
            Identificador único del contrato del empleado
          </p>
        </div>

        {/* ID Sede */}
        <div>
          <label htmlFor="idSede" className="block text-sm font-medium text-gray-700 mb-2">
            Sede *
          </label>
          <input
            type="number"
            id="idSede"
            name="idSede"
            value={formData.idSede}
            onChange={handleChange}
            disabled={isLoading}
            min="1"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.idSede ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="ID de la sede"
          />
          {errors.idSede && <p className="mt-1 text-sm text-red-600">{errors.idSede}</p>}
        </div>

        {/* Departamento */}
        <div>
          <label htmlFor="nomDept" className="block text-sm font-medium text-gray-700 mb-2">
            Departamento *
          </label>
          <input
            type="text"
            id="nomDept"
            name="nomDept"
            value={formData.nomDept}
            onChange={handleChange}
            disabled={isLoading}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.nomDept ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ej: Urgencias, Consulta Externa"
          />
          {errors.nomDept && <p className="mt-1 text-sm text-red-600">{errors.nomDept}</p>}
        </div>

        {/* Cargo */}
        <div className="md:col-span-2">
          <label htmlFor="cargo" className="block text-sm font-medium text-gray-700 mb-2">
            Cargo *
          </label>
          <input
            type="text"
            id="cargo"
            name="cargo"
            value={formData.cargo}
            onChange={handleChange}
            disabled={isLoading}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.cargo ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ej: Médico General, Enfermera, Recepcionista"
          />
          {errors.cargo && <p className="mt-1 text-sm text-red-600">{errors.cargo}</p>}
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-4 justify-end pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading || loadingPersonas}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
        </button>
      </div>
    </form>
  );
}
