'use client';

import { useState, useEffect } from 'react';
import { Paciente, CreatePacienteDto, UpdatePacienteDto } from '@/types/paciente';
import { pacientesApi } from '@/lib/api/pacientes';
import { personasApi } from '@/lib/api/personas';

interface PacienteFormProps {
  paciente?: Paciente;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function PacienteForm({ paciente, onSuccess, onCancel }: PacienteFormProps) {
  const [formData, setFormData] = useState({
    codPac: 0,
    idSede: 1,
    numDoc: '',
    drPac: '',
    fechaNac: '',
    genero: '',
    estadoPaciente: 'Activo',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [personaExists, setPersonaExists] = useState(false);
  const [personaNombre, setPersonaNombre] = useState('');

  useEffect(() => {
    if (paciente) {
      setFormData({
        codPac: paciente.codPac,
        idSede: paciente.idSede || 1,
        numDoc: paciente.numDoc,
        drPac: paciente.drPac || '',
        fechaNac: paciente.fechaNac,
        genero: paciente.genero,
        estadoPaciente: paciente.estadoPaciente || 'Activo',
      });
      setPersonaExists(true);
      if (paciente.persona) {
        setPersonaNombre(paciente.persona.nomPers);
      }
    } else {
      loadNextCodigo();
    }
  }, [paciente]);

  const loadNextCodigo = async () => {
    try {
      const nextCodigo = await pacientesApi.getNextCodigo();
      setFormData((prev) => ({ ...prev, codPac: nextCodigo }));
    } catch (error) {
      console.error('Error loading next codigo:', error);
    }
  };

  const checkPersona = async (numDoc: string) => {
    if (!numDoc) {
      setPersonaExists(false);
      setPersonaNombre('');
      return;
    }

    try {
      const persona = await personasApi.getByNumDoc(numDoc);
      setPersonaExists(true);
      setPersonaNombre(persona.nomPers);
      setError(null);
    } catch (error) {
      setPersonaExists(false);
      setPersonaNombre('');
      setError('La persona con este documento no existe en el sistema');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!personaExists && !paciente) {
      setError('Debe seleccionar un documento de persona válido');
      setIsLoading(false);
      return;
    }

    try {
      if (paciente) {
        const updateData: UpdatePacienteDto = {
          drPac: formData.drPac || undefined,
          fechaNac: formData.fechaNac || undefined,
          genero: formData.genero || undefined,
        };
        await pacientesApi.update(paciente.codPac, updateData);
      } else {
        const createData: CreatePacienteDto = {
          codPac: formData.codPac,
          idSede: formData.idSede,
          numDoc: formData.numDoc,
          drPac: formData.drPac || undefined,
          fechaNac: formData.fechaNac,
          genero: formData.genero,
          estadoPaciente: formData.estadoPaciente,
        };
        await pacientesApi.create(createData);
      }
      onSuccess();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al guardar paciente');
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
          value={formData.codPac}
          onChange={(e) => setFormData({ ...formData, codPac: parseInt(e.target.value) })}
          disabled={!!paciente}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">ID Sede *</label>
        <input
          type="number"
          value={formData.idSede}
          onChange={(e) => setFormData({ ...formData, idSede: parseInt(e.target.value) })}
          disabled={!!paciente}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          min={1}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Documento de Identidad *
        </label>
        <input
          type="text"
          value={formData.numDoc}
          onChange={(e) => setFormData({ ...formData, numDoc: e.target.value })}
          onBlur={(e) => checkPersona(e.target.value)}
          disabled={!!paciente}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
        {personaNombre && (
          <p className="mt-1 text-sm text-green-600">✓ {personaNombre}</p>
        )}
        {error && formData.numDoc && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Dirección</label>
        <input
          type="text"
          value={formData.drPac}
          onChange={(e) => setFormData({ ...formData, drPac: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          maxLength={80}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Fecha de Nacimiento *
        </label>
        <input
          type="date"
          value={formData.fechaNac}
          onChange={(e) => setFormData({ ...formData, fechaNac: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Género *</label>
        <select
          value={formData.genero}
          onChange={(e) => setFormData({ ...formData, genero: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        >
          <option value="">Seleccione...</option>
          <option value="Masculino">Masculino</option>
          <option value="Femenino">Femenino</option>
          <option value="Otro">Otro</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Estado del Paciente</label>
        <select
          value={formData.estadoPaciente}
          onChange={(e) => setFormData({ ...formData, estadoPaciente: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="Activo">Activo</option>
          <option value="Inactivo">Inactivo</option>
        </select>
      </div>

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
          disabled={isLoading || (!personaExists && !paciente)}
        >
          {isLoading ? 'Guardando...' : paciente ? 'Actualizar' : 'Crear'}
        </button>
      </div>
    </form>
  );
}
