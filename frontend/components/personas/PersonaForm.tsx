'use client';

import { useState } from 'react';
import { Persona, CreatePersonaRequest, UpdatePersonaRequest } from '@/types/persona';

interface PersonaFormProps {
  persona?: Persona;
  onSubmit: (data: CreatePersonaRequest | UpdatePersonaRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const TIPOS_DOC = [
  { value: 'CC', label: 'Cédula de Ciudadanía' },
  { value: 'TI', label: 'Tarjeta de Identidad' },
  { value: 'CE', label: 'Cédula de Extranjería' },
  { value: 'PA', label: 'Pasaporte' },
  { value: 'RC', label: 'Registro Civil' },
];

export default function PersonaForm({ persona, onSubmit, onCancel, isLoading }: PersonaFormProps) {
  const isEditing = !!persona;
  
  const [formData, setFormData] = useState({
    numDoc: persona?.numDoc || '',
    tipoDoc: persona?.tipoDoc || 'CC',
    nomPers: persona?.nomPers || '',
    correo: persona?.correo || '',
    telPers: persona?.telPers || '',
    idSedeRegistro: persona?.idSedeRegistro || 1,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.numDoc.trim()) {
      newErrors.numDoc = 'El número de documento es requerido';
    } else if (formData.numDoc.length < 5 || formData.numDoc.length > 20) {
      newErrors.numDoc = 'El número de documento debe tener entre 5 y 20 caracteres';
    }

    if (!formData.tipoDoc) {
      newErrors.tipoDoc = 'El tipo de documento es requerido';
    }

    if (!formData.nomPers.trim()) {
      newErrors.nomPers = 'El nombre es requerido';
    } else if (formData.nomPers.length < 3 || formData.nomPers.length > 50) {
      newErrors.nomPers = 'El nombre debe tener entre 3 y 50 caracteres';
    }

    if (formData.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      newErrors.correo = 'El correo electrónico no es válido';
    } else if (formData.correo && formData.correo.length > 60) {
      newErrors.correo = 'El correo no puede exceder 60 caracteres';
    }

    if (formData.telPers && (formData.telPers.length < 7 || formData.telPers.length > 20)) {
      newErrors.telPers = 'El teléfono debe tener entre 7 y 20 dígitos';
    }

    if (formData.telPers && !/^\+?[\d\s-]+$/.test(formData.telPers)) {
      newErrors.telPers = 'El teléfono solo puede contener números, espacios, guiones y el símbolo +';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const submitData = isEditing
      ? {
          tipoDoc: formData.tipoDoc,
          nomPers: formData.nomPers,
          correo: formData.correo || undefined,
          telPers: formData.telPers || undefined,
        }
      : {
          numDoc: formData.numDoc,
          tipoDoc: formData.tipoDoc,
          nomPers: formData.nomPers,
          correo: formData.correo || undefined,
          telPers: formData.telPers || undefined,
          idSedeRegistro: formData.idSedeRegistro,
        };

    await onSubmit(submitData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Limpiar error del campo al modificarlo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Número de Documento */}
        <div>
          <label htmlFor="numDoc" className="block text-sm font-medium text-gray-700 mb-2">
            Número de Documento *
          </label>
          <input
            type="text"
            id="numDoc"
            name="numDoc"
            value={formData.numDoc}
            onChange={handleChange}
            disabled={isEditing || isLoading}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.numDoc ? 'border-red-500' : 'border-gray-300'
            } ${isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            placeholder="Ej: 1234567890"
          />
          {errors.numDoc && <p className="mt-1 text-sm text-red-600">{errors.numDoc}</p>}
        </div>

        {/* Tipo de Documento */}
        <div>
          <label htmlFor="tipoDoc" className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Documento *
          </label>
          <select
            id="tipoDoc"
            name="tipoDoc"
            value={formData.tipoDoc}
            onChange={handleChange}
            disabled={isLoading}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.tipoDoc ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            {TIPOS_DOC.map(tipo => (
              <option key={tipo.value} value={tipo.value}>
                {tipo.label}
              </option>
            ))}
          </select>
          {errors.tipoDoc && <p className="mt-1 text-sm text-red-600">{errors.tipoDoc}</p>}
        </div>

        {/* Nombre */}
        <div className="md:col-span-2">
          <label htmlFor="nomPers" className="block text-sm font-medium text-gray-700 mb-2">
            Nombre Completo *
          </label>
          <input
            type="text"
            id="nomPers"
            name="nomPers"
            value={formData.nomPers}
            onChange={handleChange}
            disabled={isLoading}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.nomPers ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ej: Juan Pérez García"
          />
          {errors.nomPers && <p className="mt-1 text-sm text-red-600">{errors.nomPers}</p>}
        </div>

        {/* Correo */}
        <div>
          <label htmlFor="correo" className="block text-sm font-medium text-gray-700 mb-2">
            Correo Electrónico
          </label>
          <input
            type="email"
            id="correo"
            name="correo"
            value={formData.correo}
            onChange={handleChange}
            disabled={isLoading}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.correo ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="ejemplo@correo.com"
          />
          {errors.correo && <p className="mt-1 text-sm text-red-600">{errors.correo}</p>}
        </div>

        {/* Teléfono */}
        <div>
          <label htmlFor="telPers" className="block text-sm font-medium text-gray-700 mb-2">
            Teléfono
          </label>
          <input
            type="tel"
            id="telPers"
            name="telPers"
            value={formData.telPers}
            onChange={handleChange}
            disabled={isLoading}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.telPers ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ej: +57 300 123 4567"
          />
          {errors.telPers && <p className="mt-1 text-sm text-red-600">{errors.telPers}</p>}
        </div>

        {/* Sede de Registro */}
        {!isEditing && (
          <div>
            <label htmlFor="idSedeRegistro" className="block text-sm font-medium text-gray-700 mb-2">
              Sede de Registro *
            </label>
            <input
              type="number"
              id="idSedeRegistro"
              name="idSedeRegistro"
              value={formData.idSedeRegistro}
              onChange={handleChange}
              disabled={isLoading}
              min="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="ID de la sede"
            />
            <p className="mt-1 text-xs text-gray-500">
              Sede hospitalaria donde se registra la persona
            </p>
          </div>
        )}
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
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
        </button>
      </div>
    </form>
  );
}
