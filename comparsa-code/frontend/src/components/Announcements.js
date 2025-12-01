import { useState, useEffect } from 'react';
import { api } from '../App';
import Navbar from './Navbar';
import { toast } from 'sonner';
import { Megaphone, Trash2, Plus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Announcements({ user, onLogout }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewAnnouncement, setShowNewAnnouncement] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    category: 'general'
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await api.get('/announcements');
      setAnnouncements(response.data);
    } catch (error) {
      toast.error('Error al cargar anuncios');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim()) {
      toast.error('Complete todos los campos');
      return;
    }

    try {
      const response = await api.post('/announcements', newAnnouncement);
      setAnnouncements([response.data, ...announcements]);
      setNewAnnouncement({ title: '', content: '', category: 'general' });
      setShowNewAnnouncement(false);
      toast.success('¡Anuncio creado!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al crear anuncio. Solo administradores pueden crear anuncios.');
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm('¿Eliminar este anuncio?')) return;

    try {
      await api.delete(`/announcements/${id}`);
      setAnnouncements(announcements.filter(a => a.id !== id));
      toast.success('Anuncio eliminado');
    } catch (error) {
      toast.error('Error al eliminar anuncio');
    }
  };

  const formatDate = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: es });
    } catch {
      return 'Hace un momento';
    }
  };

  return (
    <div data-testid="announcements-page">
      <Navbar user={user} onLogout={onLogout} />

      <div className="main-container">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Megaphone className="text-blue-600" size={32} />
            Anuncios Oficiales
          </h1>
          {user.role === 'admin' && (
            <button
              onClick={() => setShowNewAnnouncement(!showNewAnnouncement)}
              className="btn btn-primary"
              data-testid="toggle-new-announcement-button"
            >
              <Plus size={20} />
              Nuevo Anuncio
            </button>
          )}
        </div>

        {/* Create Announcement Form */}
        {showNewAnnouncement && user.role === 'admin' && (
          <div className="card mb-6" data-testid="new-announcement-form">
            <h2 className="card-header">Crear Nuevo Anuncio</h2>
            <form onSubmit={handleCreateAnnouncement}>
              <div className="form-group">
                <label className="form-label">Título</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Título del anuncio"
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                  data-testid="new-announcement-title-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contenido</label>
                <textarea
                  className="form-textarea"
                  placeholder="Contenido del anuncio"
                  value={newAnnouncement.content}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                  rows={4}
                  data-testid="new-announcement-content-textarea"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Categoría</label>
                <select
                  className="form-select"
                  value={newAnnouncement.category}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, category: e.target.value })}
                  data-testid="new-announcement-category-select"
                >
                  <option value="general">General</option>
                  <option value="urgent">Urgente</option>
                  <option value="event">Evento</option>
                  <option value="info">Información</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button type="submit" className="btn btn-primary" data-testid="submit-announcement-button">
                  Publicar Anuncio
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewAnnouncement(false)}
                  className="btn btn-secondary"
                  data-testid="cancel-announcement-button"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Announcements List */}
        {loading ? (
          <div className="loading" data-testid="announcements-loading">Cargando anuncios...</div>
        ) : announcements.length === 0 ? (
          <div className="empty-state" data-testid="announcements-empty-state">
            <div className="empty-state-icon">📢</div>
            <p>No hay anuncios aún</p>
          </div>
        ) : (
          <div className="space-y-4" data-testid="announcements-list">
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                className="card border-l-4 border-blue-600"
                data-testid={`announcement-${announcement.id}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          announcement.category === 'urgent'
                            ? 'bg-red-100 text-red-700'
                            : announcement.category === 'event'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                        data-testid="announcement-category-badge"
                      >
                        {announcement.category === 'urgent'
                          ? 'Urgente'
                          : announcement.category === 'event'
                          ? 'Evento'
                          : announcement.category === 'info'
                          ? 'Información'
                          : 'General'}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2" data-testid="announcement-title">
                      {announcement.title}
                    </h3>
                    <p className="text-gray-600 mb-3 whitespace-pre-wrap" data-testid="announcement-content">
                      {announcement.content}
                    </p>
                    <div className="text-sm text-gray-500">
                      Publicado por <span className="font-semibold">{announcement.created_by_name}</span>
                      {' • '}
                      {formatDate(announcement.created_at)}
                    </div>
                  </div>
                  {user.role === 'admin' && (
                    <button
                      onClick={() => handleDeleteAnnouncement(announcement.id)}
                      className="text-gray-400 hover:text-red-500 transition ml-4"
                      data-testid="delete-announcement-button"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}