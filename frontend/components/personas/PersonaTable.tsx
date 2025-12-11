'use client';

import { Persona } from '@/types/persona';
import { useState } from 'react';

interface PersonaTableProps {
  personas: Persona[];
  onEdit: (persona: Persona) => void;
  onDelete: (numDoc: string) => void;
  isLoading?: boolean;
}

export default function PersonaTable({ personas, onEdit, onDelete, isLoading }: PersonaTableProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const getTipoDocLabel = (tipoDoc: string) => {
    const tipos: Record<string, string> = {
      CC: 'Cédula de Ciudadanía',
      TI: 'Tarjeta de Identidad',
      CE: 'Cédula de Extranjería',
      PA: 'Pasaporte',
      RC: 'Registro Civil',
    };
    return tipos[tipoDoc] || tipoDoc;
  };

  const handleDeleteClick = (numDoc: string) => {
    if (deleteConfirm === numDoc) {
      onDelete(numDoc);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(numDoc);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (personas.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay personas registradas</h3>
        <p className="mt-1 text-sm text-gray-500">Comienza creando una nueva persona.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Documento
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tipo
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nombre
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Correo
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Teléfono
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {personas.map((persona) => (
            <tr key={persona.numDoc} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {persona.numDoc}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {persona.tipoDoc}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {persona.nomPers}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {persona.correo || (
                  <span className="text-gray-400 italic">No registrado</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {persona.telPers || (
                  <span className="text-gray-400 italic">No registrado</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => onEdit(persona)}
                    className="text-blue-600 hover:text-blue-900 transition-colors"
                    title="Editar"
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
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteClick(persona.numDoc)}
                    className={`transition-colors ${
                      deleteConfirm === persona.numDoc
                        ? 'text-red-700 font-semibold'
                        : 'text-red-600 hover:text-red-900'
                    }`}
                    title={deleteConfirm === persona.numDoc ? 'Confirmar eliminación' : 'Eliminar'}
                  >
                    {deleteConfirm === persona.numDoc ? (
                      <span className="text-xs">¿Confirmar?</span>
                    ) : (
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
