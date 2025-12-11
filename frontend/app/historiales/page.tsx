'use client';

import { useState, useEffect } from 'react';
import { historialesApi } from '@/lib/api/historiales';
import { empleadosApi } from '@/lib/api/empleados';
import { pacientesApi } from '@/lib/api/pacientes';
import { sedesApi } from '@/lib/api/sedes';
import { HistorialMedico, CreateHistorialMedicoDto, UpdateHistorialMedicoDto } from '@/lib/types/historial-medico';
import { Empleado } from '@/lib/types/empleado';
import { Paciente } from '@/lib/types/paciente';
import { Sede } from '@/lib/types/sede';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

function HistorialesContent() {
  const [historiales, setHistoriales] = useState<HistorialMedico[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pacienteFilter, setPacienteFilter] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [editingHistorial, setEditingHistorial] = useState<HistorialMedico | null>(null);
  const [formData, setFormData] = useState<CreateHistorialMedicoDto>({
    codHist: 0,
    fecha: '',
    hora: '',
    diagnostico: '',
    idSede: 0,
    nomDept: '',
    idEmp: 0,
    codPac: 0,
  });

  useEffect(() => {
    loadData();
  }, [pacienteFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (pacienteFilter) params.codPac = parseInt(pacienteFilter);

      const [historialesData, empleadosData, pacientesData, sedesData] = await Promise.all([
        historialesApi.getAll(params),
        empleadosApi.getAll(),
        pacientesApi.getAll(),
        sedesApi.getAll(),
      ]);

      setHistoriales(Array.isArray(historialesData) ? historialesData : []);
      setEmpleados(Array.isArray(empleadosData) ? empleadosData : []);
      setPacientes(Array.isArray(pacientesData) ? pacientesData : []);
      setSedes(Array.isArray(sedesData) ? sedesData : []);
    } catch (error) {
      console.error('Error cargando datos:', error);
      alert('Error al cargar los datos');
      setHistoriales([]);
      setEmpleados([]);
      setPacientes([]);
      setSedes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const nextId = (historiales || []).length > 0 ? Math.max(...(historiales || []).map(h => h.codHist)) + 1 : 1;
      await historialesApi.create({ ...formData, codHist: nextId });
      setShowModal(false);
      resetForm();
      loadData();
    } catch (error: any) {
      console.error('Error creando historial:', error);
      alert(error.response?.data?.message || 'Error al crear el historial');
    }
  };

  const handleUpdate = async () => {
    if (!editingHistorial) return;
    try {
      const updateDto: UpdateHistorialMedicoDto = {
        fecha: formData.fecha,
        hora: formData.hora,
        diagnostico: formData.diagnostico,
        nomDept: formData.nomDept,
      };
      await historialesApi.update(editingHistorial.codHist, updateDto);
      setShowModal(false);
      setEditingHistorial(null);
      resetForm();
      loadData();
    } catch (error: any) {
      console.error('Error actualizando historial:', error);
      alert(error.response?.data?.message || 'Error al actualizar el historial');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar este historial?')) return;
    try {
      await historialesApi.delete(id);
      loadData();
    } catch (error) {
      console.error('Error eliminando historial:', error);
      alert('Error al eliminar el historial');
    }
  };

  const openEditModal = (historial: HistorialMedico) => {
    setEditingHistorial(historial);
    setFormData({
      codHist: historial.codHist,
      fecha: historial.fecha,
      hora: historial.hora,
      diagnostico: historial.diagnostico,
      idSede: historial.idSede,
      nomDept: historial.nomDept || '',
      idEmp: historial.idEmp,
      codPac: historial.codPac,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      codHist: 0,
      fecha: '',
      hora: '',
      diagnostico: '',
      idSede: 0,
      nomDept: '',
      idEmp: 0,
      codPac: 0,
    });
    setEditingHistorial(null);
  };

  const filteredHistoriales = (historiales || []).filter((hist) => {
    const matchesSearch =
      hist.diagnostico.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hist.paciente?.persona?.nomPers.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hist.empleado?.persona?.nomPers.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Cargando...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Historiales Médicos</h1>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Nuevo Historial
        </button>
      </div>

      <div className="mb-4 flex gap-4">
        <input
          type="text"
          placeholder="Buscar por diagnóstico, paciente o médico..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-600 bg-gray-900 text-white rounded"
        />
        <select
          value={pacienteFilter}
          onChange={(e) => setPacienteFilter(e.target.value)}
          className="px-4 py-2 border border-gray-600 bg-gray-900 text-white rounded"
        >
          <option value="">Todos los pacientes</option>
          {pacientes.map((pac) => (
            <option key={pac.codPac} value={pac.codPac}>
              {pac.persona?.nomPers}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-2xl border border-gray-700 overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Hora</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Paciente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Médico</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Diagnóstico</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {filteredHistoriales.map((hist) => (
              <tr key={hist.codHist} className="hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{hist.codHist}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{hist.fecha}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{hist.hora}</td>
                <td className="px-6 py-4 text-sm text-white">{hist.paciente?.persona?.nomPers || 'N/A'}</td>
                <td className="px-6 py-4 text-sm text-white">{hist.empleado?.persona?.nomPers || 'N/A'}</td>
                <td className="px-6 py-4 text-sm max-w-xs truncate text-white">{hist.diagnostico}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => openEditModal(hist)}
                    className="text-blue-600 hover:text-blue-800 mr-3"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(hist.codHist)}
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
              {editingHistorial ? 'Editar Historial' : 'Nuevo Historial'}
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">Fecha</label>
                  <input
                    type="date"
                    value={formData.fecha}
                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-600 bg-gray-900 text-white rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">Hora</label>
                  <input
                    type="time"
                    value={formData.hora}
                    onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-600 bg-gray-900 text-white rounded"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Diagnóstico</label>
                <textarea
                  value={formData.diagnostico}
                  onChange={(e) => setFormData({ ...formData, diagnostico: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-600 bg-gray-900 text-white rounded"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">Sede</label>
                  <select
                    value={formData.idSede}
                    onChange={(e) => setFormData({ ...formData, idSede: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-600 bg-gray-900 text-white rounded"
                    required
                    disabled={!!editingHistorial}
                  >
                    <option value={0}>Seleccione una sede</option>
                    {sedes.map((sede) => (
                      <option key={sede.idSede} value={sede.idSede}>
                        {sede.nomSede}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">Departamento (opcional)</label>
                  <input
                    type="text"
                    value={formData.nomDept}
                    onChange={(e) => setFormData({ ...formData, nomDept: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-600 bg-gray-900 text-white rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Médico</label>
                <select
                  value={formData.idEmp}
                  onChange={(e) => setFormData({ ...formData, idEmp: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-600 bg-gray-900 text-white rounded"
                  required
                  disabled={!!editingHistorial}
                >
                  <option value={0}>Seleccione un médico</option>
                  {empleados.map((emp) => (
                    <option key={emp.idEmp} value={emp.idEmp}>
                      {emp.persona?.nomPers} - {emp.cargo}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Paciente</label>
                <select
                  value={formData.codPac}
                  onChange={(e) => setFormData({ ...formData, codPac: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-600 bg-gray-900 text-white rounded"
                  required
                  disabled={!!editingHistorial}
                >
                  <option value={0}>Seleccione un paciente</option>
                  {pacientes.map((pac) => (
                    <option key={pac.codPac} value={pac.codPac}>
                      {pac.persona?.nomPers} - {pac.numDoc}
                    </option>
                  ))}
                </select>
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
                  onClick={editingHistorial ? handleUpdate : handleCreate}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {editingHistorial ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HistorialesPage() {
  return (
    <ProtectedRoute allowedRoles={['administrador', 'medico', 'enfermero']}>
      <HistorialesContent />
    </ProtectedRoute>
  );
}
