'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/auth';
import { personasApi } from '@/lib/api/personas';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [personaData, setPersonaData] = useState({
    numDoc: '',
    tipoDoc: 'CC',
    nomPers: '',
    correo: '',
    telPers: '',
  });
  const [usuarioData, setUsuarioData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    rol: 'personal_administrativo' as const,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePersonaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Crear persona primero
      await personasApi.create(personaData);
      setStep(2);
    } catch (err: any) {
      console.error('Error creating persona:', err);
      setError(err.response?.data?.message || 'Error al crear la persona. El documento puede estar duplicado.');
    } finally {
      setLoading(false);
    }
  };

  const handleUsuarioSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (usuarioData.password !== usuarioData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (usuarioData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      await authApi.register({
        numDoc: personaData.numDoc,
        username: usuarioData.username,
        password: usuarioData.password,
        rol: usuarioData.rol,
      });

      alert('Usuario registrado exitosamente. Ahora puedes iniciar sesión.');
      router.push('/login');
    } catch (err: any) {
      console.error('Error creating usuario:', err);
      setError(err.response?.data?.message || 'Error al crear el usuario. El nombre de usuario puede estar en uso.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-2xl border border-gray-700 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Registro de Usuario</h1>
          <p className="text-gray-300">Paso {step} de 2</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handlePersonaSubmit} className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-300 mb-4">Datos Personales</h2>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Tipo de Documento
              </label>
              <select
                value={personaData.tipoDoc}
                onChange={(e) => setPersonaData({ ...personaData, tipoDoc: e.target.value })}
                className="w-full px-4 py-2 border border-gray-600 bg-gray-900 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="CC">Cédula de Ciudadanía</option>
                <option value="TI">Tarjeta de Identidad</option>
                <option value="CE">Cédula de Extranjería</option>
                <option value="PP">Pasaporte</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Número de Documento
              </label>
              <input
                type="text"
                value={personaData.numDoc}
                onChange={(e) => setPersonaData({ ...personaData, numDoc: e.target.value })}
                className="w-full px-4 py-2 border border-gray-600 bg-gray-900 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Nombre Completo
              </label>
              <input
                type="text"
                value={personaData.nomPers}
                onChange={(e) => setPersonaData({ ...personaData, nomPers: e.target.value })}
                className="w-full px-4 py-2 border border-gray-600 bg-gray-900 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={personaData.correo}
                onChange={(e) => setPersonaData({ ...personaData, correo: e.target.value })}
                className="w-full px-4 py-2 border border-gray-600 bg-gray-900 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                value={personaData.telPers}
                onChange={(e) => setPersonaData({ ...personaData, telPers: e.target.value })}
                className="w-full px-4 py-2 border border-gray-600 bg-gray-900 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Procesando...' : 'Continuar'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleUsuarioSubmit} className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-300 mb-4">Datos de Acceso</h2>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Nombre de Usuario
              </label>
              <input
                type="text"
                value={usuarioData.username}
                onChange={(e) => setUsuarioData({ ...usuarioData, username: e.target.value })}
                className="w-full px-4 py-2 border border-gray-600 bg-gray-900 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                minLength={3}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Contraseña (mínimo 6 caracteres)
              </label>
              <input
                type="password"
                value={usuarioData.password}
                onChange={(e) => setUsuarioData({ ...usuarioData, password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-600 bg-gray-900 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                minLength={6}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Confirmar Contraseña
              </label>
              <input
                type="password"
                value={usuarioData.confirmPassword}
                onChange={(e) => setUsuarioData({ ...usuarioData, confirmPassword: e.target.value })}
                className="w-full px-4 py-2 border border-gray-600 bg-gray-900 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                minLength={6}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Rol
              </label>
              <select
                value={usuarioData.rol}
                onChange={(e) => setUsuarioData({ ...usuarioData, rol: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-600 bg-gray-900 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="personal_administrativo">Personal Administrativo</option>
                <option value="enfermero">Enfermero</option>
                <option value="medico">Médico</option>
                <option value="administrador">Administrador</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Atrás
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Registrando...' : 'Registrar'}
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-300">
            ¿Ya tienes cuenta?{' '}
            <button
              onClick={() => router.push('/login')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Iniciar Sesión
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
