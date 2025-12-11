'use client';

import { useState, useEffect } from 'react';
import { agendaCitasApi } from '@/lib/api/agenda-citas';
import { empleadosApi } from '@/lib/api/empleados';
import { pacientesApi } from '@/lib/api/pacientes';
import { sedesApi } from '@/lib/api/sedes';
import { AgendaCita, EstadoCita, CreateAgendaCitaDto, UpdateAgendaCitaDto } from '@/lib/types/agenda-cita';
import { Empleado } from '@/lib/types/empleado';
import { Paciente } from '@/lib/types/paciente';
import { Sede } from '@/lib/types/sede';

export default function AgendaCitasPage() {
  const [citas, setCitas] = useState<AgendaCita[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<string>('');
  const [fechaFilter, setFechaFilter] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [editingCita, setEditingCita] = useState<AgendaCita | null>(null);
  const [formData, setFormData] = useState<CreateAgendaCitaDto>({
    idCita: 0,
    fecha: '',
    hora: '',
    tipoServicio: '',
    estado: EstadoCita.Programada,
    idSede: 0,
    nomDept: '',
    idEmp: 0,
    codPac: 0,
  });

  useEffect(() => {
    loadData();
  }, [estadoFilter, fechaFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (estadoFilter) params.estado = estadoFilter;
      if (fechaFilter) params.fecha = fechaFilter;

      const [citasData, empleadosData, pacientesData, sedesData] = await Promise.all([
        agendaCitasApi.getAll(params),
        empleadosApi.getAll(),
        pacientesApi.getAll(),
        sedesApi.getAll(),
      ]);

      setCitas(citasData);
      setEmpleados(empleadosData);
      setPacientes(pacientesData);
      setSedes(sedesData);
    } catch (error) {
      console.error('Error cargando datos:', error);
      alert('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const nextId = citas.length > 0 ? Math.max(...citas.map(c => c.idCita)) + 1 : 1;
      await agendaCitasApi.create({ ...formData, idCita: nextId });
      setShowModal(false);
      resetForm();
      loadData();
    } catch (error: any) {
      console.error('Error creando cita:', error);
      alert(error.response?.data?.message || 'Error al crear la cita');
    }
  };

  const handleUpdate = async () => {
    if (!editingCita) return;
    try {
      const updateDto: UpdateAgendaCitaDto = {
        fecha: formData.fecha,
        hora: formData.hora,
        tipoServicio: formData.tipoServicio,
        estado: formData.estado,
        nomDept: formData.nomDept,
      };
      await agendaCitasApi.update(editingCita.idCita, updateDto);
      setShowModal(false);
      setEditingCita(null);
      resetForm();
      loadData();
    } catch (error: any) {
      console.error('Error actualizando cita:', error);
      alert(error.response?.data?.message || 'Error al actualizar la cita');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar esta cita?')) return;
    try {
      await agendaCitasApi.delete(id);
      loadData();
    } catch (error) {
      console.error('Error eliminando cita:', error);
      alert('Error al eliminar la cita');
    }
  };

  const openEditModal = (cita: AgendaCita) => {
    setEditingCita(cita);
    setFormData({
      idCita: cita.idCita,
      fecha: cita.fecha,
      hora: cita.hora,
      tipoServicio: cita.tipoServicio,
      estado: cita.estado,
      idSede: cita.idSede,
      nomDept: cita.nomDept || '',
      idEmp: cita.idEmp,
      codPac: cita.codPac,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      idCita: 0,
      fecha: '',
      hora: '',
      tipoServicio: '',
      estado: EstadoCita.Programada,
      idSede: 0,
      nomDept: '',
      idEmp: 0,
      codPac: 0,
    });
    setEditingCita(null);
  };

  const filteredCitas = citas.filter((cita) => {
    const matchesSearch =
      cita.tipoServicio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cita.empleado?.persona?.nomPers.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cita.paciente?.persona?.nomPers.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Programada':
        return 'bg-blue-100 text-blue-800';
      case 'Completada':
        return 'bg-green-100 text-green-800';
      case 'Cancelada':
        return 'bg-red-100 text-red-800';
      case 'No Asistió':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Cargando...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Agenda de Citas</h1>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Nueva Cita
        </button>
      </div>

      <div className="mb-4 flex gap-4">
        <input
          type="text"
          placeholder="Buscar por servicio, empleado o paciente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border rounded"
        />
        <select
          value={estadoFilter}
          onChange={(e) => setEstadoFilter(e.target.value)}
          className="px-4 py-2 border rounded"
        >
          <option value="">Todos los estados</option>
          <option value="Programada">Programada</option>
          <option value="Completada">Completada</option>
          <option value="Cancelada">Cancelada</option>
          <option value="No Asistió">No Asistió</option>
        </select>
        <input
          type="date"
          value={fechaFilter}
          onChange={(e) => setFechaFilter(e.target.value)}
          className="px-4 py-2 border rounded"
        />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hora</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Servicio</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Empleado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paciente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredCitas.map((cita) => (
              <tr key={cita.idCita} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm">{cita.idCita}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{cita.fecha}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{cita.hora}</td>
                <td className="px-6 py-4 text-sm">{cita.tipoServicio}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(cita.estado)}`}>
                    {cita.estado}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">{cita.empleado?.persona?.nomPers || 'N/A'}</td>
                <td className="px-6 py-4 text-sm">{cita.paciente?.persona?.nomPers || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => openEditModal(cita)}
                    className="text-blue-600 hover:text-blue-800 mr-3"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(cita.idCita)}
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
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingCita ? 'Editar Cita' : 'Nueva Cita'}
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Fecha</label>
                  <input
                    type="date"
                    value={formData.fecha}
                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Hora</label>
                  <input
                    type="time"
                    value={formData.hora}
                    onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tipo de Servicio</label>
                <input
                  type="text"
                  value={formData.tipoServicio}
                  onChange={(e) => setFormData({ ...formData, tipoServicio: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Estado</label>
                <select
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value as EstadoCita })}
                  className="w-full px-3 py-2 border rounded"
                  required
                >
                  <option value={EstadoCita.Programada}>Programada</option>
                  <option value={EstadoCita.Completada}>Completada</option>
                  <option value={EstadoCita.Cancelada}>Cancelada</option>
                  <option value={EstadoCita.NoAsistio}>No Asistió</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Sede</label>
                  <select
                    value={formData.idSede}
                    onChange={(e) => setFormData({ ...formData, idSede: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded"
                    required
                    disabled={!!editingCita}
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
                  <label className="block text-sm font-medium mb-1">Departamento (opcional)</label>
                  <input
                    type="text"
                    value={formData.nomDept}
                    onChange={(e) => setFormData({ ...formData, nomDept: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Empleado</label>
                <select
                  value={formData.idEmp}
                  onChange={(e) => setFormData({ ...formData, idEmp: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded"
                  required
                  disabled={!!editingCita}
                >
                  <option value={0}>Seleccione un empleado</option>
                  {empleados.map((emp) => (
                    <option key={emp.idEmp} value={emp.idEmp}>
                      {emp.persona?.nomPers} - {emp.cargo}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Paciente</label>
                <select
                  value={formData.codPac}
                  onChange={(e) => setFormData({ ...formData, codPac: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded"
                  required
                  disabled={!!editingCita}
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
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  onClick={editingCita ? handleUpdate : handleCreate}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {editingCita ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
