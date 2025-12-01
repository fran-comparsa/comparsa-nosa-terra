import { useState, useEffect } from 'react';
import { api } from '../App';
import Navbar from './Navbar';
import { toast } from 'sonner';
import { Users, FileText, Calendar, Megaphone, Trash2, Shield } from 'lucide-react';

export default function AdminPanel({ user, onLogout }) {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data);
    } catch (error) {
      toast.error('Error al cargar estadísticas');
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (error) {
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('¿Eliminar este usuario y todo su contenido?')) return;

    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(users.filter(u => u.id !== userId));
      toast.success('Usuario eliminado');
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al eliminar usuario');
    }
  };

  const handleToggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'member' : 'admin';
    if (!window.confirm(`¿Cambiar rol a ${newRole}?`)) return;

    try {
      await api.put(`/admin/users/${userId}/role?role=${newRole}`);
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      toast.success('Rol actualizado');
    } catch (error) {
      toast.error('Error al actualizar rol');
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div data-testid="admin-panel-page">
      <Navbar user={user} onLogout={onLogout} />

      <div className="main-container">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <Shield className="text-blue-600" size={32} />
          Panel de Administración
        </h1>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8" data-testid="admin-stats">
            <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Usuarios</p>
                  <p className="text-3xl font-bold" data-testid="stat-users">{stats.total_users}</p>
                </div>
                <Users size={40} className="opacity-80" />
              </div>
            </div>

            <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Publicaciones</p>
                  <p className="text-3xl font-bold" data-testid="stat-posts">{stats.total_posts}</p>
                </div>
                <FileText size={40} className="opacity-80" />
              </div>
            </div>

            <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Eventos</p>
                  <p className="text-3xl font-bold" data-testid="stat-events">{stats.total_events}</p>
                </div>
                <Calendar size={40} className="opacity-80" />
              </div>
            </div>

            <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Anuncios</p>
                  <p className="text-3xl font-bold" data-testid="stat-announcements">{stats.total_announcements}</p>
                </div>
                <Megaphone size={40} className="opacity-80" />
              </div>
            </div>
          </div>
        )}

        {/* Users Management */}
        <div className="card">
          <h2 className="card-header">Gestión de Usuarios</h2>

          {loading ? (
            <div className="loading" data-testid="users-loading">Cargando usuarios...</div>
          ) : (
            <div className="overflow-x-auto" data-testid="users-table">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Usuario</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Rol</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Fecha Registro</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b hover:bg-gray-50" data-testid={`user-row-${u.id}`}>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center text-white font-semibold">
                            {u.name[0]}
                          </div>
                          <span className="font-medium" data-testid="user-name">{u.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600" data-testid="user-email">{u.email}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            u.role === 'admin'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                          data-testid="user-role-badge"
                        >
                          {u.role === 'admin' ? 'Admin' : 'Miembro'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-sm">
                        {formatDate(u.created_at)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          {u.id !== user.id && (
                            <>
                              <button
                                onClick={() => handleToggleRole(u.id, u.role)}
                                className="text-sm px-3 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
                                data-testid="toggle-role-button"
                              >
                                {u.role === 'admin' ? 'Hacer Miembro' : 'Hacer Admin'}
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u.id)}
                                className="text-red-500 hover:text-red-700 transition"
                                data-testid="delete-user-button"
                              >
                                <Trash2 size={18} />
                              </button>
                            </>
                          )}
                          {u.id === user.id && (
                            <span className="text-sm text-gray-400 italic">Tú</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}