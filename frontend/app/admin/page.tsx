'use client';

import { useState, useEffect } from 'react';
import { usuariosApi } from '@/lib/api/client';
import { useAuth } from '@/contexts/AuthContext';

interface Usuario {
  idUsuario: number;
  username: string;
  numDoc: string;
  rol: string;
  activo: boolean;
  fechaCreacion: string;
  persona?: {
    nomPers: string;
    correo?: string;
    telPers?: string;
  };
}

interface ActivityLog {
  idLog: number;
  accion: string;
  detalles?: string;
  fechaAccion: string;
  usuario?: {
    username: string;
    rol: string;
    persona?: {
      nomPers: string;
    };
  };
}

export default function AdminUsuariosPage() {
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [filteredUsuarios, setFilteredUsuarios] = useState<Usuario[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [filterRol, setFilterRol] = useState<string>('todos');
  const [filterActivo, setFilterActivo] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState('');

  // Estados para edición
  const [editRol, setEditRol] = useState('');
  const [editActivo, setEditActivo] = useState(true);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    if (user?.rol === 'administrador') {
      loadUsuarios();
      loadActivityLogs();
    }
  }, [user]);

  useEffect(() => {
    filterUsuarios();
  }, [usuarios, filterRol, filterActivo, searchTerm]);

  const loadUsuarios = async () => {
    try {
      setLoading(true);
      const data = await usuariosApi.getAll();
      setUsuarios(data);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      alert('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const loadActivityLogs = async () => {
    try {
      const response = await fetch('http://localhost:3001/auth/activity-logs?limit=100', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setActivityLogs(data);
      }
    } catch (error) {
      console.error('Error al cargar logs:', error);
    }
  };

  const loadUserActivityLogs = async (userId: number) => {
    try {
      const response = await fetch(`http://localhost:3001/auth/usuarios/${userId}/activity-logs?limit=50`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setActivityLogs(data);
      }
    } catch (error) {
      console.error('Error al cargar logs del usuario:', error);
    }
  };

  const filterUsuarios = () => {
    let filtered = [...usuarios];

    if (filterRol !== 'todos') {
      filtered = filtered.filter(u => u.rol === filterRol);
    }

    if (filterActivo === 'activos') {
      filtered = filtered.filter(u => u.activo);
    } else if (filterActivo === 'inactivos') {
      filtered = filtered.filter(u => !u.activo);
    }

    if (searchTerm) {
      filtered = filtered.filter(u =>
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.numDoc.includes(searchTerm) ||
        u.persona?.nomPers.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsuarios(filtered);
  };

  const handleEditUsuario = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setEditRol(usuario.rol);
    setEditActivo(usuario.activo);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedUsuario) return;

    try {
      await usuariosApi.update(selectedUsuario.idUsuario, {
        rol: editRol,
        activo: editActivo,
      });
      setShowEditModal(false);
      loadUsuarios();
      loadActivityLogs();
      alert('Usuario actualizado exitosamente');
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      alert('Error al actualizar usuario');
    }
  };

  const handleResetPassword = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setNewPassword('');
    setShowResetPasswordModal(true);
  };

  const handleSaveResetPassword = async () => {
    if (!selectedUsuario || !newPassword) {
      alert('Por favor ingrese una nueva contraseña');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/auth/usuarios/${selectedUsuario.idUsuario}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ newPassword }),
      });

      if (response.ok) {
        setShowResetPasswordModal(false);
        loadActivityLogs();
        alert('Contraseña restablecida exitosamente');
      } else {
        alert('Error al restablecer contraseña');
      }
    } catch (error) {
      console.error('Error al restablecer contraseña:', error);
      alert('Error al restablecer contraseña');
    }
  };

  const handleViewLogs = async (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    await loadUserActivityLogs(usuario.idUsuario);
    setShowLogsModal(true);
  };

  const handleDeleteUsuario = async (usuario: Usuario) => {
    if (!confirm(`¿Está seguro de eliminar el usuario ${usuario.username}?`)) return;

    try {
      await usuariosApi.delete(usuario.idUsuario);
      loadUsuarios();
      loadActivityLogs();
      alert('Usuario eliminado exitosamente');
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      alert('Error al eliminar usuario');
    }
  };

  if (user?.rol !== 'administrador') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-red-600">Acceso Denegado</h1>
          <p>No tiene permisos para acceder a esta página.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8 flex items-center justify-center">
        <div className="text-xl">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Gestión de Usuarios</h1>

          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Usuario, nombre o documento..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por Rol</label>
              <select
                value={filterRol}
                onChange={(e) => setFilterRol(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="todos">Todos</option>
                <option value="administrador">Administrador</option>
                <option value="medico">Médico</option>
                <option value="enfermero">Enfermero</option>
                <option value="personal_administrativo">Personal Administrativo</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por Estado</label>
              <select
                value={filterActivo}
                onChange={(e) => setFilterActivo(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="todos">Todos</option>
                <option value="activos">Activos</option>
                <option value="inactivos">Inactivos</option>
              </select>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{usuarios.length}</div>
              <div className="text-sm text-gray-600">Total Usuarios</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {usuarios.filter(u => u.activo).length}
              </div>
              <div className="text-sm text-gray-600">Activos</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {usuarios.filter(u => !u.activo).length}
              </div>
              <div className="text-sm text-gray-600">Inactivos</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{filteredUsuarios.length}</div>
              <div className="text-sm text-gray-600">Filtrados</div>
            </div>
          </div>

          {/* Tabla de usuarios */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsuarios.map((usuario) => (
                  <tr key={usuario.idUsuario} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{usuario.username}</div>
                      <div className="text-sm text-gray-500">{usuario.numDoc}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{usuario.persona?.nomPers || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{usuario.persona?.correo || ''}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        usuario.rol === 'administrador' ? 'bg-purple-100 text-purple-800' :
                        usuario.rol === 'medico' ? 'bg-blue-100 text-blue-800' :
                        usuario.rol === 'enfermero' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {usuario.rol}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        usuario.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {usuario.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEditUsuario(usuario)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleResetPassword(usuario)}
                        className="text-yellow-600 hover:text-yellow-900"
                      >
                        Reset Pass
                      </button>
                      <button
                        onClick={() => handleViewLogs(usuario)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Logs
                      </button>
                      {usuario.idUsuario !== user?.idUsuario && (
                        <button
                          onClick={() => handleDeleteUsuario(usuario)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Eliminar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Logs Recientes */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Actividad Reciente</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {activityLogs.map((log) => (
              <div key={log.idLog} className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50">
                <div className="flex justify-between">
                  <div>
                    <span className="font-semibold">{log.usuario?.username || 'Usuario'}</span>
                    <span className="text-gray-600"> - {log.accion}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(log.fechaAccion).toLocaleString('es-ES')}
                  </span>
                </div>
                {log.detalles && (
                  <div className="text-sm text-gray-600 mt-1">{log.detalles}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de Edición */}
      {showEditModal && selectedUsuario && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Editar Usuario: {selectedUsuario.username}</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Rol</label>
              <select
                value={editRol}
                onChange={(e) => setEditRol(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="administrador">Administrador</option>
                <option value="medico">Médico</option>
                <option value="enfermero">Enfermero</option>
                <option value="personal_administrativo">Personal Administrativo</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={editActivo}
                  onChange={(e) => setEditActivo(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Usuario Activo</span>
              </label>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSaveEdit}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Guardar
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Reset Password */}
      {showResetPasswordModal && selectedUsuario && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Restablecer Contraseña: {selectedUsuario.username}</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Nueva Contraseña</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSaveResetPassword}
                className="flex-1 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700"
              >
                Restablecer
              </button>
              <button
                onClick={() => setShowResetPasswordModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Logs */}
      {showLogsModal && selectedUsuario && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Historial de Actividad: {selectedUsuario.username}</h2>
            
            <div className="space-y-2">
              {activityLogs.map((log) => (
                <div key={log.idLog} className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50">
                  <div className="flex justify-between">
                    <span className="font-semibold">{log.accion}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(log.fechaAccion).toLocaleString('es-ES')}
                    </span>
                  </div>
                  {log.detalles && (
                    <div className="text-sm text-gray-600 mt-1">{log.detalles}</div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4">
              <button
                onClick={() => setShowLogsModal(false)}
                className="w-full bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
