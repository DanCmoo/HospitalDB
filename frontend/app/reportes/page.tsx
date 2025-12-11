'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { reportesApi } from '@/lib/api/reportes';
import { pacientesApi } from '@/lib/api/pacientes';
import { sedesApi } from '@/lib/api/sedes';

function ReportesContent() {
  const [tipoReporte, setTipoReporte] = useState<'general' | 'paciente' | 'sede'>('general');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Formulario para reporte de paciente
  const [codPac, setCodPac] = useState('');
  
  // Formulario para reporte de sede
  const [idSede, setIdSede] = useState('');
  
  // Fechas opcionales
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const handleGenerarReporte = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      let blob: Blob;
      let nombreArchivo: string;

      switch (tipoReporte) {
        case 'general':
          blob = await reportesApi.generarReporteGeneral({
            fechaInicio: fechaInicio || undefined,
            fechaFin: fechaFin || undefined,
          });
          nombreArchivo = `reporte_general_${Date.now()}.pdf`;
          break;

        case 'paciente':
          if (!codPac) {
            setError('Debe ingresar el código del paciente');
            setLoading(false);
            return;
          }
          blob = await reportesApi.generarReportePaciente({
            codPac: parseInt(codPac),
            fechaInicio: fechaInicio || undefined,
            fechaFin: fechaFin || undefined,
          });
          nombreArchivo = `reporte_paciente_${codPac}_${Date.now()}.pdf`;
          break;

        case 'sede':
          if (!idSede) {
            setError('Debe ingresar el ID de la sede');
            setLoading(false);
            return;
          }
          blob = await reportesApi.generarReporteSede({
            idSede: parseInt(idSede),
            fechaInicio: fechaInicio || undefined,
            fechaFin: fechaFin || undefined,
          });
          nombreArchivo = `reporte_sede_${idSede}_${Date.now()}.pdf`;
          break;

        default:
          throw new Error('Tipo de reporte no válido');
      }

      reportesApi.descargarPDF(blob, nombreArchivo);
      setSuccess(`Reporte generado exitosamente: ${nombreArchivo}`);
    } catch (err: any) {
      console.error('Error generando reporte:', err);
      setError(err.response?.data?.message || 'Error al generar el reporte');
    } finally {
      setLoading(false);
    }
  };

  const limpiarFormulario = () => {
    setCodPac('');
    setIdSede('');
    setFechaInicio('');
    setFechaFin('');
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📊 Sistema de Reportes
          </h1>
          <p className="text-gray-600">
            Genera reportes en PDF con información detallada del hospital
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Selector de tipo de reporte */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Reporte
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => {
                  setTipoReporte('general');
                  limpiarFormulario();
                }}
                className={`p-4 rounded-lg border-2 transition-all ${
                  tipoReporte === 'general'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-blue-400'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">📈</div>
                  <div className="font-semibold">Reporte General</div>
                  <div className="text-xs text-gray-600 mt-1">
                    Estadísticas globales del hospital
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  setTipoReporte('paciente');
                  limpiarFormulario();
                }}
                className={`p-4 rounded-lg border-2 transition-all ${
                  tipoReporte === 'paciente'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-blue-400'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">🏥</div>
                  <div className="font-semibold">Reporte de Paciente</div>
                  <div className="text-xs text-gray-600 mt-1">
                    Historial médico completo
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  setTipoReporte('sede');
                  limpiarFormulario();
                }}
                className={`p-4 rounded-lg border-2 transition-all ${
                  tipoReporte === 'sede'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-blue-400'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">🏢</div>
                  <div className="font-semibold">Reporte de Sede</div>
                  <div className="text-xs text-gray-600 mt-1">
                    Información de sede hospitalaria
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Formulario específico según el tipo */}
          <div className="mb-6">
            {tipoReporte === 'paciente' && (
              <div className="mb-4">
                <label htmlFor="codPac" className="block text-sm font-medium text-gray-700 mb-2">
                  Código del Paciente *
                </label>
                <input
                  id="codPac"
                  type="number"
                  value={codPac}
                  onChange={(e) => setCodPac(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ingrese el código del paciente"
                  required
                />
              </div>
            )}

            {tipoReporte === 'sede' && (
              <div className="mb-4">
                <label htmlFor="idSede" className="block text-sm font-medium text-gray-700 mb-2">
                  ID de la Sede *
                </label>
                <input
                  id="idSede"
                  type="number"
                  value={idSede}
                  onChange={(e) => setIdSede(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ingrese el ID de la sede"
                  required
                />
              </div>
            )}

            {/* Filtros de fecha (opcionales para todos los tipos) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="fechaInicio" className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha Inicio (Opcional)
                </label>
                <input
                  id="fechaInicio"
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="fechaFin" className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha Fin (Opcional)
                </label>
                <input
                  id="fechaFin"
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Mensajes de error y éxito */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
              ✅ {success}
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex gap-4">
            <button
              onClick={handleGenerarReporte}
              disabled={loading}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-colors ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-3"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Generando PDF...
                </span>
              ) : (
                '📄 Generar Reporte PDF'
              )}
            </button>

            <button
              onClick={limpiarFormulario}
              className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Limpiar
            </button>
          </div>

          {/* Información adicional */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Información</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Los reportes se generan en formato PDF</li>
              <li>• Las fechas son opcionales (sin filtro muestra todo)</li>
              <li>• El reporte se descargará automáticamente al generarse</li>
              <li>• Solo usuarios administrativos pueden generar reportes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReportesPage() {
  return (
    <ProtectedRoute allowedRoles={['personal_administrativo', 'administrador']}>
      <ReportesContent />
    </ProtectedRoute>
  );
}
