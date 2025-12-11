'use client';

import { useState, useEffect } from 'react';
import { prescripcionesApi } from '@/lib/api/prescripciones';
import { medicamentosApi } from '@/lib/api/medicamentos';
import { agendaCitasApi } from '@/lib/api/agenda-citas';
import { Prescribe, CreatePrescribeDto, UpdatePrescribeDto } from '@/lib/types/prescribe';
import { Medicamento } from '@/lib/types/medicamento';
import { AgendaCita } from '@/lib/types/agenda-cita';

export default function PrescripcionesPage() {
  const [prescripciones, setPrescripciones] = useState<Prescribe[]>([]);
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [citas, setCitas] = useState<AgendaCita[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [citaFilter, setCitaFilter] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [editingPrescripcion, setEditingPrescripcion] = useState<Prescribe | null>(null);
  const [formData, setFormData] = useState<CreatePrescribeDto>({
    codMed: 0,
    idCita: 0,
    dosis: 1,
    frecuencia: 1,
    duracion: '',
    fechaEmision: '',
  });

  useEffect(() => {
    loadData();
  }, [citaFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (citaFilter) params.idCita = parseInt(citaFilter);

      const [prescripcionesData, medicamentosData, citasData] = await Promise.all([
        prescripcionesApi.getAll(params),
        medicamentosApi.getAll(),
        agendaCitasApi.getAll(),
      ]);

      setPrescripciones(Array.isArray(prescripcionesData) ? prescripcionesData : []);
      setMedicamentos(Array.isArray(medicamentosData) ? medicamentosData : []);
      setCitas(Array.isArray(citasData) ? citasData : []);
    } catch (error) {
      console.error('Error cargando datos:', error);
      alert('Error al cargar los datos');
      setPrescripciones([]);
      setMedicamentos([]);
      setCitas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await prescripcionesApi.create(formData);
      setShowModal(false);
      resetForm();
      loadData();
    } catch (error: any) {
      console.error('Error creando prescripción:', error);
      alert(error.response?.data?.message || 'Error al crear la prescripción');
    }
  };

  const handleUpdate = async () => {
    if (!editingPrescripcion) return;
    try {
      const updateDto: UpdatePrescribeDto = {
        dosis: formData.dosis,
        frecuencia: formData.frecuencia,
        duracion: formData.duracion,
        fechaEmision: formData.fechaEmision,
      };
      await prescripcionesApi.update(editingPrescripcion.codMed, editingPrescripcion.idCita, updateDto);
      setShowModal(false);
      setEditingPrescripcion(null);
      resetForm();
      loadData();
    } catch (error: any) {
      console.error('Error actualizando prescripción:', error);
      alert(error.response?.data?.message || 'Error al actualizar la prescripción');
    }
  };

  const handleDelete = async (codMed: number, idCita: number) => {
    if (!confirm('¿Está seguro de eliminar esta prescripción?')) return;
    try {
      await prescripcionesApi.delete(codMed, idCita);
      loadData();
    } catch (error) {
      console.error('Error eliminando prescripción:', error);
      alert('Error al eliminar la prescripción');
    }
  };

  const openEditModal = (prescripcion: Prescribe) => {
    setEditingPrescripcion(prescripcion);
    setFormData({
      codMed: prescripcion.codMed,
      idCita: prescripcion.idCita,
      dosis: prescripcion.dosis,
      frecuencia: prescripcion.frecuencia,
      duracion: prescripcion.duracion,
      fechaEmision: prescripcion.fechaEmision,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      codMed: 0,
      idCita: 0,
      dosis: 1,
      frecuencia: 1,
      duracion: '',
      fechaEmision: '',
    });
    setEditingPrescripcion(null);
  };

  const filteredPrescripciones = (prescripciones || []).filter((prescripcion) => {
    const matchesSearch =
      prescripcion.medicamento?.nomMed.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescripcion.cita?.paciente?.persona?.nomPers.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Cargando...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Prescripciones</h1>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Nueva Prescripción
        </button>
      </div>

      <div className="mb-4 flex gap-4">
        <input
          type="text"
          placeholder="Buscar por medicamento o paciente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-600 bg-gray-900 text-white rounded"
        />
        <select
          value={citaFilter}
          onChange={(e) => setCitaFilter(e.target.value)}
          className="px-4 py-2 border border-gray-600 bg-gray-900 text-white rounded"
        >
          <option value="">Todas las citas</option>
          {citas.map((cita) => (
            <option key={cita.idCita} value={cita.idCita}>
              Cita #{cita.idCita} - {cita.fecha} - {cita.paciente?.persona?.nomPers}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-2xl border border-gray-700 overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Medicamento</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Cita</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Paciente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Dosis</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Frecuencia (hrs)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Duración</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Fecha Emisión</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {filteredPrescripciones.map((prescripcion) => (
              <tr key={`${prescripcion.codMed}-${prescripcion.idCita}`} className="hover:bg-gray-700">
                <td className="px-6 py-4 text-sm text-white">
                  {prescripcion.medicamento?.nomMed || 'N/A'}
                  <div className="text-xs text-gray-400">Stock: {prescripcion.medicamento?.stock || 0}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">#{prescripcion.idCita}</td>
                <td className="px-6 py-4 text-sm text-white">{prescripcion.cita?.paciente?.persona?.nomPers || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{prescripcion.dosis}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{prescripcion.frecuencia}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{prescripcion.duracion}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{prescripcion.fechaEmision}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => openEditModal(prescripcion)}
                    className="text-blue-600 hover:text-blue-800 mr-3"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(prescripcion.codMed, prescripcion.idCita)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-white">
              {editingPrescripcion ? 'Editar Prescripción' : 'Nueva Prescripción'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Medicamento</label>
                <select
                  value={formData.codMed}
                  onChange={(e) => setFormData({ ...formData, codMed: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-600 bg-gray-900 text-white rounded"
                  required
                  disabled={!!editingPrescripcion}
                >
                  <option value={0}>Seleccione un medicamento</option>
                  {medicamentos.map((med) => (
                    <option key={med.codMed} value={med.codMed}>
                      {med.nomMed} - Stock: {med.stock}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Cita</label>
                <select
                  value={formData.idCita}
                  onChange={(e) => setFormData({ ...formData, idCita: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-600 bg-gray-900 text-white rounded"
                  required
                  disabled={!!editingPrescripcion}
                >
                  <option value={0}>Seleccione una cita</option>
                  {citas.map((cita) => (
                    <option key={cita.idCita} value={cita.idCita}>
                      #{cita.idCita} - {cita.fecha} - {cita.paciente?.persona?.nomPers} - {cita.tipoServicio}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">Dosis</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.dosis}
                    onChange={(e) => setFormData({ ...formData, dosis: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-600 bg-gray-900 text-white rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">Frecuencia (horas)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.frecuencia}
                    onChange={(e) => setFormData({ ...formData, frecuencia: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-600 bg-gray-900 text-white rounded"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">Duración</label>
                  <input
                    type="date"
                    value={formData.duracion}
                    onChange={(e) => setFormData({ ...formData, duracion: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-600 bg-gray-900 text-white rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">Fecha de Emisión</label>
                  <input
                    type="date"
                    value={formData.fechaEmision}
                    onChange={(e) => setFormData({ ...formData, fechaEmision: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-600 bg-gray-900 text-white rounded"
                    required
                  />
                </div>
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
                  onClick={editingPrescripcion ? handleUpdate : handleCreate}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {editingPrescripcion ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
