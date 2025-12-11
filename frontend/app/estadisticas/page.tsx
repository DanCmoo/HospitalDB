'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { estadisticasApi } from '@/lib/api/estadisticas';

function EstadisticasContent() {
  const [activeTab, setActiveTab] = useState<string>('medicamentos');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Parámetros para filtros
  const [codPac, setCodPac] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const cargarDatos = async (tipo: string) => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      let resultado;
      switch (tipo) {
        case 'medicamentos':
          resultado = await estadisticasApi.getMedicamentosMasRecetados();
          break;
        case 'medicos':
          resultado = await estadisticasApi.getMedicosConMasConsultas();
          break;
        case 'tiempo-diagnostico':
          resultado = await estadisticasApi.getTiempoPromedioDiagnostico();
          break;
        case 'auditoria-historiales':
          resultado = await estadisticasApi.getUltimosAccesosHistoriales(10);
          break;
        case 'equipamiento-compartido':
          resultado = await estadisticasApi.getDepartamentosEquipamientoCompartido();
          break;
        case 'pacientes-enfermedad':
          resultado = await estadisticasApi.getPacientesPorEnfermedad({
            fechaInicio: fechaInicio || undefined,
            fechaFin: fechaFin || undefined,
          });
          break;
        case 'historiales-consolidados':
          resultado = await estadisticasApi.getHistorialesConsolidados(
            codPac ? parseInt(codPac) : undefined
          );
          break;
        default:
          resultado = null;
      }
      setData(resultado);
    } catch (err: any) {
      console.error('Error cargando datos:', err);
      setError(err.response?.data?.message || 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos(activeTab);
  }, [activeTab]);

  const renderMedicamentos = () => {
    if (!Array.isArray(data) || data.length === 0) {
      return <p className="text-gray-400">No hay datos disponibles</p>;
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">#</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Medicamento</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Veces Recetado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Stock Actual</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {data.map((item: any, idx: number) => (
              <tr key={idx} className="hover:bg-gray-700">
                <td className="px-6 py-4 text-sm text-white">{idx + 1}</td>
                <td className="px-6 py-4 text-sm text-white">{item.medicamento?.nomMed || 'N/A'}</td>
                <td className="px-6 py-4 text-sm text-white">{item.cantidad}</td>
                <td className="px-6 py-4 text-sm text-white">{item.medicamento?.stock || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderMedicos = () => {
    if (!Array.isArray(data) || data.length === 0) {
      return <p className="text-gray-400">No hay datos disponibles</p>;
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">#</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Médico</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Cargo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Consultas (última semana)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {data.map((item: any, idx: number) => (
              <tr key={idx} className="hover:bg-gray-700">
                <td className="px-6 py-4 text-sm text-white">{idx + 1}</td>
                <td className="px-6 py-4 text-sm text-white">{item.empleado?.persona?.nomPers || 'N/A'}</td>
                <td className="px-6 py-4 text-sm text-white">{item.empleado?.cargo || 'N/A'}</td>
                <td className="px-6 py-4 text-sm text-white font-bold">{item.consultas}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderTiempoDiagnostico = () => {
    if (!data) {
      return <p className="text-gray-400">No hay datos disponibles</p>;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-400 mb-2">⏱️ Tiempo Promedio</h3>
          <p className="text-4xl font-bold text-white">{data.promedioHoras || 0} horas</p>
          <p className="text-sm text-gray-400 mt-2">({data.promedioMinutos || 0} minutos)</p>
        </div>
        <div className="bg-green-900/30 border border-green-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-400 mb-2">📊 Datos Analizados</h3>
          <p className="text-sm text-gray-300">Citas analizadas: <span className="font-bold text-white">{data.citasAnalizadas || 0}</span></p>
          <p className="text-sm text-gray-300">Citas con historial: <span className="font-bold text-white">{data.citasConHistorial || 0}</span></p>
        </div>
      </div>
    );
  };

  const renderAuditoriaHistoriales = () => {
    if (!Array.isArray(data) || data.length === 0) {
      return <p className="text-gray-400">No hay datos disponibles</p>;
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">ID Evento</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Usuario</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Acción</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">IP Origen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {data.map((item: any) => (
              <tr key={item.idEvento} className="hover:bg-gray-700">
                <td className="px-6 py-4 text-sm text-white">{item.idEvento}</td>
                <td className="px-6 py-4 text-sm text-white">{new Date(item.fechaEvento).toLocaleString()}</td>
                <td className="px-6 py-4 text-sm text-white">{item.persona?.nomPers || 'N/A'}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded ${
                    item.accion === 'INSERT' ? 'bg-green-100 text-green-800' :
                    item.accion === 'UPDATE' ? 'bg-yellow-100 text-yellow-800' :
                    item.accion === 'DELETE' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {item.accion}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-white">{item.ipOrigen || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderEquipamientoCompartido = () => {
    if (!Array.isArray(data) || data.length === 0) {
      return <p className="text-gray-400">No hay equipamiento compartido entre sedes</p>;
    }

    return (
      <div className="space-y-4">
        {data.map((item: any, idx: number) => (
          <div key={idx} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-lg font-semibold text-white">{item.equipamiento}</h4>
                <p className="text-sm text-gray-400">
                  Departamento: <span className="text-white">{item.departamentoActual}</span> - Sede: <span className="text-white">{item.sedeActual}</span>
                </p>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-sm font-medium text-blue-400 mb-2">Compartido con:</p>
              <div className="space-y-1">
                {item.compartidoCon.map((comp: any, i: number) => (
                  <p key={i} className="text-sm text-gray-300 ml-4">
                    • {comp.departamento} - {comp.sede}
                  </p>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderPacientesEnfermedad = () => {
    if (!Array.isArray(data) || data.length === 0) {
      return <p className="text-gray-400">No hay datos disponibles</p>;
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">#</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Diagnóstico/Enfermedad</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Total Pacientes</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Total Registros</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {data.map((item: any, idx: number) => (
              <tr key={idx} className="hover:bg-gray-700">
                <td className="px-6 py-4 text-sm text-white">{idx + 1}</td>
                <td className="px-6 py-4 text-sm text-white">{item.diagnostico}</td>
                <td className="px-6 py-4 text-sm text-white font-bold">{item.totalPacientes}</td>
                <td className="px-6 py-4 text-sm text-white">{item.totalRegistros}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderHistorialesConsolidados = () => {
    if (!Array.isArray(data) || data.length === 0) {
      return <p className="text-gray-400">No hay historiales disponibles</p>;
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Paciente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Médico</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Diagnóstico</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Sede</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {data.map((item: any) => (
              <tr key={`${item.codHist}-${item.idSede}`} className="hover:bg-gray-700">
                <td className="px-6 py-4 text-sm text-white">{item.codHist}</td>
                <td className="px-6 py-4 text-sm text-white">{new Date(item.fecha).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-sm text-white">{item.paciente?.persona?.nomPers || 'N/A'}</td>
                <td className="px-6 py-4 text-sm text-white">{item.empleado?.persona?.nomPers || 'N/A'}</td>
                <td className="px-6 py-4 text-sm text-white max-w-xs truncate">{item.diagnostico}</td>
                <td className="px-6 py-4 text-sm text-white">
                  <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">
                    Sede {item.idSede}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gray-800 rounded-lg shadow-2xl border border-gray-700 p-6 mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">
            📊 Estadísticas Avanzadas
          </h1>
          <p className="text-gray-300">
            Análisis detallado y reportes estadísticos del sistema hospitalario
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-gray-800 rounded-lg shadow-2xl border border-gray-700 mb-6">
          <div className="flex flex-wrap border-b border-gray-700">
            <button
              onClick={() => setActiveTab('medicamentos')}
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === 'medicamentos'
                  ? 'border-b-2 border-blue-500 text-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              💊 Medicamentos Más Recetados
            </button>
            <button
              onClick={() => setActiveTab('medicos')}
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === 'medicos'
                  ? 'border-b-2 border-blue-500 text-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              👨‍⚕️ Médicos Top
            </button>
            <button
              onClick={() => setActiveTab('tiempo-diagnostico')}
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === 'tiempo-diagnostico'
                  ? 'border-b-2 border-blue-500 text-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              ⏱️ Tiempo Diagnóstico
            </button>
            <button
              onClick={() => setActiveTab('auditoria-historiales')}
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === 'auditoria-historiales'
                  ? 'border-b-2 border-blue-500 text-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              🔍 Auditoría Historiales
            </button>
            <button
              onClick={() => setActiveTab('equipamiento-compartido')}
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === 'equipamiento-compartido'
                  ? 'border-b-2 border-blue-500 text-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              🔗 Equipamiento Compartido
            </button>
            <button
              onClick={() => setActiveTab('pacientes-enfermedad')}
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === 'pacientes-enfermedad'
                  ? 'border-b-2 border-blue-500 text-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              🏥 Pacientes por Enfermedad
            </button>
            <button
              onClick={() => setActiveTab('historiales-consolidados')}
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === 'historiales-consolidados'
                  ? 'border-b-2 border-blue-500 text-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              📑 Historiales Consolidados
            </button>
          </div>

          {/* Filtros específicos */}
          {(activeTab === 'pacientes-enfermedad' || activeTab === 'historiales-consolidados') && (
            <div className="p-4 bg-gray-800 border-b border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {activeTab === 'historiales-consolidados' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Código Paciente (opcional)
                    </label>
                    <input
                      type="number"
                      value={codPac}
                      onChange={(e) => setCodPac(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-600 bg-gray-900 text-white rounded-lg"
                      placeholder="Ingrese código del paciente"
                    />
                  </div>
                )}
                {activeTab === 'pacientes-enfermedad' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Fecha Inicio
                      </label>
                      <input
                        type="date"
                        value={fechaInicio}
                        onChange={(e) => setFechaInicio(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-600 bg-gray-900 text-white rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Fecha Fin
                      </label>
                      <input
                        type="date"
                        value={fechaFin}
                        onChange={(e) => setFechaFin(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-600 bg-gray-900 text-white rounded-lg"
                      />
                    </div>
                  </>
                )}
                <div className="flex items-end">
                  <button
                    onClick={() => cargarDatos(activeTab)}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    🔍 Buscar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Contenido */}
          <div className="p-6">
            {loading && (
              <div className="flex justify-center items-center py-12">
                <div className="text-xl text-gray-400">Cargando datos...</div>
              </div>
            )}

            {error && (
              <div className="bg-red-900/30 border border-red-700 text-red-200 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {!loading && !error && (
              <>
                {activeTab === 'medicamentos' && renderMedicamentos()}
                {activeTab === 'medicos' && renderMedicos()}
                {activeTab === 'tiempo-diagnostico' && renderTiempoDiagnostico()}
                {activeTab === 'auditoria-historiales' && renderAuditoriaHistoriales()}
                {activeTab === 'equipamiento-compartido' && renderEquipamientoCompartido()}
                {activeTab === 'pacientes-enfermedad' && renderPacientesEnfermedad()}
                {activeTab === 'historiales-consolidados' && renderHistorialesConsolidados()}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EstadisticasPage() {
  return (
    <ProtectedRoute allowedRoles={['personal_administrativo', 'administrador', 'medico']}>
      <EstadisticasContent />
    </ProtectedRoute>
  );
}
