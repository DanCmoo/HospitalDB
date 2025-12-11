'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';

function DashboardContent() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-800">Hospital Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Bienvenido, <strong>{user?.persona?.nomPers || user?.username}</strong> ({user?.rol})
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          Dashboard - Sistema Hospitalario
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a href="/pacientes" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Pacientes
            </h3>
            <p className="text-gray-600">
              Gestión de información de pacientes
            </p>
          </a>
          <a href="/agenda-citas" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Citas
            </h3>
            <p className="text-gray-600">
              Administración de agenda médica
            </p>
          </a>
          <a href="/medicamentos" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Medicamentos
            </h3>
            <p className="text-gray-600">
              Control de prescripciones y stock
            </p>
          </a>
          <a href="/historiales" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Historiales
            </h3>
            <p className="text-gray-600">
              Historiales médicos de pacientes
            </p>
          </a>
          <a href="/empleados" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Empleados
            </h3>
            <p className="text-gray-600">
              Gestión del personal médico
            </p>
          </a>
          <a href="/equipamiento" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Equipamiento
            </h3>
            <p className="text-gray-600">
              Control de equipos y mantenimiento
            </p>
          </a>
          <a href="/reportes" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border-2 border-blue-600">
            <h3 className="text-xl font-semibold text-blue-700 mb-2">
              📊 Reportes
            </h3>
            <p className="text-gray-600">
              Generar reportes en PDF
            </p>
          </a>
          {user?.rol === 'administrador' && (
            <a href="/admin" className="bg-gradient-to-br from-purple-600 to-indigo-700 p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer border-2 border-purple-700">
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

