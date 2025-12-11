'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';

function DashboardContent() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const sedeName = process.env.NEXT_PUBLIC_SEDE_NOMBRE || 'Sede Desconocida';
  const sedeColor = process.env.NEXT_PUBLIC_SEDE_COLOR || '#3B82F6';

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-white">Hospital Management</h1>
              <div 
                className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                style={{ backgroundColor: sedeColor }}
              >
                {sedeName}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-300">
                Bienvenido, <strong className="text-white">{user?.persona?.nomPers || user?.username}</strong> <span className="text-gray-400">({user?.rol})</span>
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="p-8">
        <h2 className="text-3xl font-bold text-white mb-6">
          Dashboard - Sistema Hospitalario
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a href="/pacientes" className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-blue-500 transition-all cursor-pointer">
            <h3 className="text-xl font-semibold text-white mb-2">
              Pacientes
            </h3>
            <p className="text-gray-400">
              Gestión de información de pacientes
            </p>
          </a>
          <a href="/agenda-citas" className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-blue-500 transition-all cursor-pointer">
            <h3 className="text-xl font-semibold text-white mb-2">
              Citas
            </h3>
            <p className="text-gray-400">
              Administración de agenda médica
            </p>
          </a>
          <a href="/medicamentos" className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-blue-500 transition-all cursor-pointer">
            <h3 className="text-xl font-semibold text-white mb-2">
              Medicamentos
            </h3>
            <p className="text-gray-400">
              Control de prescripciones y stock
            </p>
          </a>
          <a href="/historiales" className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-blue-500 transition-all cursor-pointer">
            <h3 className="text-xl font-semibold text-white mb-2">
              Historiales
            </h3>
            <p className="text-gray-400">
              Historiales médicos de pacientes
            </p>
          </a>
          <a href="/empleados" className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-blue-500 transition-all cursor-pointer">
            <h3 className="text-xl font-semibold text-white mb-2">
              Empleados
            </h3>
            <p className="text-gray-400">
              Gestión del personal médico
            </p>
          </a>
          <a href="/equipamiento" className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-blue-500 transition-all cursor-pointer">
            <h3 className="text-xl font-semibold text-white mb-2">
              Equipamiento
            </h3>
            <p className="text-gray-400">
              Control de equipos y mantenimiento
            </p>
          </a>
          <a href="/reportes" className="bg-gray-800 p-6 rounded-lg border-2 border-blue-600 hover:border-blue-500 transition-all cursor-pointer">
            <h3 className="text-xl font-semibold text-blue-400 mb-2">
              📊 Reportes
            </h3>
            <p className="text-gray-400">
              Generar reportes en PDF
            </p>
          </a>
          <a href="/estadisticas" className="bg-gray-800 p-6 rounded-lg border-2 border-green-600 hover:border-green-500 transition-all cursor-pointer">
            <h3 className="text-xl font-semibold text-green-400 mb-2">
              📈 Estadísticas
            </h3>
            <p className="text-gray-400">
              Análisis y métricas avanzadas
            </p>
          </a>
          {user?.rol === 'administrador' && (
            <a href="/admin" className="bg-gradient-to-br from-purple-600 to-indigo-700 p-6 rounded-lg border-2 border-purple-500 hover:border-purple-400 transition-all cursor-pointer">
              <h3 className="text-xl font-semibold text-white mb-2">
                👥 Administración
              </h3>
              <p className="text-purple-100">
                Gestión avanzada de usuarios
              </p>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

