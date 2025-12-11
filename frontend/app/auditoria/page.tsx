'use client';

import { useState, useEffect } from 'react';
import { auditoriaApi } from '@/lib/api/auditoria';
import { personasApi } from '@/lib/api/personas';
import { Auditoria, CreateAuditoriaDto } from '@/lib/types/auditoria';
import { Persona } from '@/lib/types/persona';

export default function AuditoriaPage() {
  const [auditorias, setAuditorias] = useState<Auditoria[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [accionFilter, setAccionFilter] = useState<string>('');
  const [tablaFilter, setTablaFilter] = useState<string>('');
  const [fechaInicioFilter, setFechaInicioFilter] = useState<string>('');
  const [fechaFinFilter, setFechaFinFilter] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<CreateAuditoriaDto>({
    numDoc: '',
    accion: '',
    fechaEvento: '',
    tablaAfectada: '',
    ipOrigen: '',
  });

  useEffect(() => {
    loadData();
  }, [accionFilter, tablaFilter, fechaInicioFilter, fechaFinFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (accionFilter) params.accion = accionFilter;
      if (tablaFilter) params.tablaAfectada = tablaFilter;
      if (fechaInicioFilter) params.fechaInicio = fechaInicioFilter;
      if (fechaFinFilter) params.fechaFin = fechaFinFilter;

      const [auditoriasData, personasData] = await Promise.all([
        auditoriaApi.getAll(params),
        personasApi.getAll(),
      ]);

      setAuditorias(auditoriasData);
      setPersonas(personasData);
    } catch (error) {
      console.error('Error cargando datos:', error);
      alert('Error al cargar los datos de auditoría');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await auditoriaApi.create(formData);
      setShowModal(false);
      resetForm();
      loadData();
    } catch (error: any) {
      console.error('Error creando registro de auditoría:', error);
      alert(error.response?.data?.message || 'Error al crear el registro de auditoría');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar este registro de auditoría? Esta acción no se puede deshacer.')) return;
    try {
      await auditoriaApi.delete(id);
      loadData();
    } catch (error) {
      console.error('Error eliminando registro:', error);
      alert('Error al eliminar el registro de auditoría');
    }
  };

  const resetForm = () => {
    setFormData({
      numDoc: '',
      accion: '',
      fechaEvento: '',
      tablaAfectada: '',
      ipOrigen: '',
    });
  };

  const getAccionColor = (accion: string) => {
    switch (accion.toUpperCase()) {
      case 'INSERT':
        return 'bg-green-100 text-green-800';
      case 'UPDATE':
        return 'bg-yellow-100 text-yellow-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      case 'SELECT':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAuditorias = auditorias.filter((aud) => {
    const matchesSearch =
      aud.accion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      aud.tablaAfectada.toLowerCase().includes(searchTerm.toLowerCase()) ||
      aud.persona?.nomPers.toLowerCase().includes(searchTerm.toLowerCase()) ||
      aud.ipOrigen?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const exportToCSV = () => {
    const headers = ['ID Evento', 'Fecha', 'Usuario', 'Acción', 'Tabla Afectada', 'IP Origen'];
    const rows = filteredAuditorias.map((aud) => [
      aud.idEvento,
      aud.fechaEvento,
      aud.persona?.nomPers || 'N/A',
      aud.accion,
      aud.tablaAfectada,
      aud.ipOrigen || 'N/A',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auditoria_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Cargando...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Auditoría</h1>
        <div className="flex gap-3">
          <button
            onClick={exportToCSV}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Exportar CSV
          </button>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Nuevo Registro
          </button>
        </div>
      </div>

      <div className="mb-4 space-y-3">
        <input
          type="text"
          placeholder="Buscar por acción, tabla, usuario o IP..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-600 bg-gray-900 text-white rounded"
        />
        <div className="grid grid-cols-4 gap-4">
          <select
            value={accionFilter}
            onChange={(e) => setAccionFilter(e.target.value)}
            className="px-4 py-2 border border-gray-600 bg-gray-900 text-white rounded"
          >
            <option value="">Todas las acciones</option>
            <option value="INSERT">INSERT</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
            <option value="SELECT">SELECT</option>
          </select>
          <select
            value={tablaFilter}
            onChange={(e) => setTablaFilter(e.target.value)}
            className="px-4 py-2 border border-gray-600 bg-gray-900 text-white rounded"
          >
            <option value="">Todas las tablas</option>
            <option value="Persona">Persona</option>
            <option value="Empleado">Empleado</option>
            <option value="Paciente">Paciente</option>
            <option value="Emite_Hist">Emite_Hist</option>
            <option value="Agenda_Citas">Agenda_Citas</option>
            <option value="Prescripciones">Prescripciones</option>
          </select>
          <input
            type="date"
            placeholder="Fecha inicio"
            value={fechaInicioFilter}
            onChange={(e) => setFechaInicioFilter(e.target.value)}
            className="px-4 py-2 border border-gray-600 bg-gray-900 text-white rounded"
          />
          <input
            type="date"
            placeholder="Fecha fin"
            value={fechaFinFilter}
            onChange={(e) => setFechaFinFilter(e.target.value)}
            className="px-4 py-2 border border-gray-600 bg-gray-900 text-white rounded"
          />
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-2xl border border-gray-700 overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Tabla</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Acción</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Usuario</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Detalles</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {filteredAuditorias.map((aud) => (
              <tr key={aud.idEvento} className="hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{aud.idEvento}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  {new Date(aud.fechaEvento).toLocaleString('es-ES')}
                </td>
                <td className="px-6 py-4 text-sm text-white">{aud.persona?.nomPers || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded ${getAccionColor(aud.accion)}`}>
                    {aud.accion}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-white">{aud.tablaAfectada}</td>
                <td className="px-6 py-4 text-sm text-white">{aud.ipOrigen || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => handleDelete(aud.idEvento)}
                    className="text-red-600 hover:text-red-800"
                    title="Solo administradores pueden eliminar registros"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-sm text-gray-300">
        Total de registros: {filteredAuditorias.length}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full border border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-white">Nuevo Registro de Auditoría</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Usuario (Documento)</label>
                <select
                  value={formData.numDoc}
                  onChange={(e) => setFormData({ ...formData, numDoc: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-600 bg-gray-900 text-white rounded"
                  required
                >
                  <option value="">Seleccione un usuario</option>
                  {personas.map((per) => (
                    <option key={per.numDoc} value={per.numDoc}>
                      {per.nomPers} - {per.numDoc}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">Acción</label>
                  <select
                    value={formData.accion}
                    onChange={(e) => setFormData({ ...formData, accion: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-600 bg-gray-900 text-white rounded"
                    required
                  >
                    <option value="">Seleccione una acción</option>
                    <option value="INSERT">INSERT</option>
                    <option value="UPDATE">UPDATE</option>
                    <option value="DELETE">DELETE</option>
                    <option value="SELECT">SELECT</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">Fecha del Evento</label>
                  <input
                    type="datetime-local"
                    value={formData.fechaEvento}
                    onChange={(e) => setFormData({ ...formData, fechaEvento: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-600 bg-gray-900 text-white rounded"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Tabla Afectada</label>
                <select
                  value={formData.tablaAfectada}
                  onChange={(e) => setFormData({ ...formData, tablaAfectada: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-600 bg-gray-900 text-white rounded"
                  required
                >
                  <option value="">Seleccione una tabla</option>
                  <option value="Persona">Persona</option>
                  <option value="Empleado">Empleado</option>
                  <option value="Paciente">Paciente</option>
                  <option value="Emite_Hist">Emite_Hist</option>
                  <option value="Agenda_Citas">Agenda_Citas</option>
                  <option value="Prescripciones">Prescripciones</option>
                  <option value="Sede">Sede</option>
                  <option value="Departamento">Departamento</option>
                  <option value="Equipamiento">Equipamiento</option>
                  <option value="Medicamento">Medicamento</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">IP Origen (opcional)</label>
                <input
                  type="text"
                  value={formData.ipOrigen}
                  onChange={(e) => setFormData({ ...formData, ipOrigen: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-600 bg-gray-900 text-white rounded"
                  placeholder="192.168.1.1"
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-600 rounded hover:bg-gray-700 text-gray-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreate}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Crear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
