import { useState, useEffect } from 'react';
import { api } from '../App';
import Navbar from './Navbar';
import Post from './Post';
import { toast } from 'sonner';
import { Plus, Calendar, MapPin, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Feed({ user, onLogout }) {
  const [posts, setPosts] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPost, setNewPost] = useState({ content: '', image_url: '', category: 'general' });
  const [categoryFilter, setCategoryFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
    fetchUpcomingEvents();
  }, [categoryFilter]);

  const fetchPosts = async () => {
    try {
      const params = categoryFilter !== 'all' ? { category: categoryFilter } : {};
      const response = await api.get('/posts', { params });
      setPosts(response.data);
    } catch (error) {
      toast.error('Error al cargar publicaciones');
    } finally {
      setLoading(false);
    }
  };

  const fetchUpcomingEvents = async () => {
    try {
      const response = await api.get('/events');
      // Filtrar eventos futuros y ordenar por fecha ascendente
      const now = new Date();
      const upcomingEvents = response.data
        .filter(event => new Date(event.end_date) > now)
        .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
        .slice(0, 5); // Mostrar solo los próximos 5 eventos
      setEvents(upcomingEvents);
    } catch (error) {
      console.error('Error al cargar eventos');
    }
  };

  const formatEventDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.content.trim()) {
      toast.error('El contenido no puede estar vacío');
      return;
    }

    try {
      const response = await api.post('/posts', newPost);
      setPosts([response.data, ...posts]);
      setNewPost({ content: '', image_url: '', category: 'general' });
      setShowNewPost(false);
      toast.success('¡Publicación creada!');
    } catch (error) {
      toast.error('Error al crear publicación');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('¿Eliminar esta publicación?')) return;

    try {
      await api.delete(`/posts/${postId}`);
      setPosts(posts.filter(p => p.id !== postId));
      toast.success('Publicación eliminada');
    } catch (error) {
      toast.error('Error al eliminar publicación');
    }
  };

  return (
    <div data-testid="feed-page">
      <Navbar user={user} onLogout={onLogout} />

      <div className="main-container">
        <div className="content-grid">
          {/* Main Feed Column */}
          <div>
            {/* Create Post */}
            <div className="card" data-testid="create-post-section">
          {!showNewPost ? (
            <div className="flex items-center gap-3">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover cursor-pointer"
                  onClick={() => navigate('/profile')}
                  data-testid="user-avatar-feed"
                />
              ) : (
                <div 
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center text-white font-semibold cursor-pointer"
                  onClick={() => navigate('/profile')}
                  data-testid="user-initials-feed"
                >
                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                </div>
              )}
              <button
                onClick={() => setShowNewPost(true)}
                className="flex-1 text-left p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition text-gray-500"
                data-testid="show-new-post-button"
              >
                ¿Qué estás pensando, {user.name}?
              </button>
            </div>
          ) : (
            <form onSubmit={handleCreatePost}>
              <textarea
                className="form-textarea"
                placeholder="¿Qué estás pensando?"
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                rows={3}
                data-testid="new-post-content-textarea"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                <input
                  type="url"
                  className="form-input"
                  placeholder="URL de imagen (opcional)"
                  value={newPost.image_url}
                  onChange={(e) => setNewPost({ ...newPost, image_url: e.target.value })}
                  data-testid="new-post-image-input"
                />

                <select
                  className="form-select"
                  value={newPost.category}
                  onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                  data-testid="new-post-category-select"
                >
                  <option value="general">General</option>
                  <option value="news">Noticias</option>
                  <option value="events">Eventos</option>
                  <option value="photos">Fotos</option>
                </select>
              </div>

              <div className="flex gap-2 mt-3">
                <button type="submit" className="btn btn-primary" data-testid="submit-new-post-button">
                  <Plus size={20} />
                  Publicar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewPost(false);
                    setNewPost({ content: '', image_url: '', category: 'general' });
                  }}
                  className="btn btn-secondary"
                  data-testid="cancel-new-post-button"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2" data-testid="category-filter">
          {['all', 'general', 'news', 'events', 'photos'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition ${
                categoryFilter === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
              data-testid={`category-filter-${cat}`}
            >
              {cat === 'all' ? 'Todas' : cat === 'general' ? 'General' : cat === 'news' ? 'Noticias' : cat === 'events' ? 'Eventos' : 'Fotos'}
            </button>
          ))}
        </div>

            {/* Posts Feed */}
            {loading ? (
              <div className="loading" data-testid="feed-loading">Cargando publicaciones...</div>
            ) : posts.length === 0 ? (
              <div className="empty-state" data-testid="feed-empty-state">
                <div className="empty-state-icon">📝</div>
                <p>No hay publicaciones aún</p>
              </div>
            ) : (
              <div data-testid="posts-list">
                {posts.map((post) => (
                  <Post
                    key={post.id}
                    post={post}
                    currentUser={user}
                    onDelete={handleDeletePost}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar - Próximos Eventos */}
          <div className="hidden lg:block">
            <div className="card sticky top-20" data-testid="upcoming-events-sidebar">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="text-blue-600" size={24} />
                <h3 className="text-lg font-bold text-gray-800">Próximos Eventos</h3>
              </div>

              {events.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar size={40} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No hay eventos próximos</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      onClick={() => navigate('/events')}
                      className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg hover:from-blue-100 hover:to-blue-200 cursor-pointer transition border border-blue-200"
                      data-testid={`sidebar-event-${event.id}`}
                    >
                      <h4 className="font-semibold text-gray-800 mb-2 text-sm">
                        {event.title}
                      </h4>
                      
                      <div className="space-y-1 text-xs text-gray-600">
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-blue-600 flex-shrink-0" />
                          <span>{formatEventDate(event.start_date)}</span>
                        </div>
                        
                        {event.location && (
                          <div className="flex items-center gap-2">
                            <MapPin size={14} className="text-blue-600 flex-shrink-0" />
                            <span className="truncate">{event.location}</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-2 text-xs">
                        <span className={`px-2 py-1 rounded font-semibold ${
                          event.category === 'rehearsal'
                            ? 'bg-purple-100 text-purple-700'
                            : event.category === 'performance'
                            ? 'bg-red-100 text-red-700'
                            : event.category === 'meeting'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {event.category === 'rehearsal' ? 'Ensayo' :
                           event.category === 'performance' ? 'Actuación' :
                           event.category === 'meeting' ? 'Reunión' :
                           event.category === 'social' ? 'Social' : 'General'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => navigate('/events')}
                className="w-full mt-4 btn btn-primary text-sm"
                data-testid="view-all-events-button"
              >
                Ver Todos los Eventos
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}