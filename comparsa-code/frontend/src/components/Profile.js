import { useState, useEffect } from 'react';
import { api } from '../App';
import Navbar from './Navbar';
import { toast } from 'sonner';
import { Camera, Mail, Phone, MapPin, Briefcase, Edit2, Save, X } from 'lucide-react';
import { useParams } from 'react-router-dom';

export default function Profile({ user: currentUser, onLogout }) {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    avatar: '',
    bio: '',
    position: '',
    phone: '',
    location: ''
  });

  const isOwnProfile = !userId || userId === currentUser.id;

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      if (isOwnProfile) {
        setUser(currentUser);
        setFormData({
          name: currentUser.name || '',
          avatar: currentUser.avatar || '',
          bio: currentUser.bio || '',
          position: currentUser.position || '',
          phone: currentUser.phone || '',
          location: currentUser.location || ''
        });
      } else {
        const response = await api.get(`/users/${userId}`);
        setUser(response.data);
      }
    } catch (error) {
      toast.error('Error al cargar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const response = await api.put('/users/profile', formData);
      setUser(response.data);
      setEditing(false);
      toast.success('¡Perfil actualizado!');
      
      // Update current user data
      window.location.reload();
    } catch (error) {
      toast.error('Error al actualizar perfil');
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return '';
    }
  };

  if (loading) {
    return (
      <div data-testid="profile-page">
        <Navbar user={currentUser} onLogout={onLogout} />
        <div className="main-container">
          <div className="loading">Cargando perfil...</div>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="profile-page">
      <Navbar user={currentUser} onLogout={onLogout} />

      <div className="main-container">
        <div className="max-w-4xl mx-auto">
          {/* Cover and Profile Picture */}
          <div className="card p-0 overflow-hidden mb-6">
            {/* Cover Photo */}
            <div className="h-48 bg-gradient-to-r from-blue-500 to-blue-600"></div>

            {/* Profile Info */}
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-20 md:-mt-16">
                {/* Avatar */}
                <div className="flex flex-col md:flex-row items-center md:items-end gap-4">
                  <div className="relative">
                    {editing ? (
                      <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-white p-1">
                        <input
                          type="text"
                          placeholder="URL de avatar"
                          className="form-input text-xs p-2"
                          value={formData.avatar}
                          onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                          data-testid="avatar-input"
                        />
                      </div>
                    ) : user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                        data-testid="profile-avatar"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center text-white text-4xl font-bold">
                        {getInitials(user.name)}
                      </div>
                    )}
                    {isOwnProfile && !editing && (
                      <button
                        className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition"
                        onClick={() => setEditing(true)}
                        data-testid="edit-profile-button"
                      >
                        <Camera size={20} />
                      </button>
                    )}
                  </div>

                  <div className="text-center md:text-left mb-4 md:mb-0">
                    {editing ? (
                      <input
                        type="text"
                        className="form-input mb-2"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        data-testid="name-input"
                      />
                    ) : (
                      <h1 className="text-3xl font-bold text-gray-800" data-testid="profile-name">
                        {user.name}
                      </h1>
                    )}
                    
                    {editing ? (
                      <select
                        className="form-select"
                        value={formData.position}
                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                        data-testid="position-select"
                      >
                        <option value="">Seleccionar cargo</option>
                        <option value="Presidente">Presidente</option>
                        <option value="Vicepresidente">Vicepresidente</option>
                        <option value="Secretario">Secretario</option>
                        <option value="Tesorero">Tesorero</option>
                        <option value="Vocal">Vocal</option>
                        <option value="Músico">Músico</option>
                        <option value="Voz">Voz</option>
                        <option value="Bailarín">Bailarín</option>
                        <option value="Diseñador">Diseñador</option>
                        <option value="Miembro">Miembro</option>
                      </select>
                    ) : user.position ? (
                      <p className="text-gray-600 font-medium" data-testid="profile-position">
                        {user.position}
                      </p>
                    ) : null}
                    
                    <p className="text-sm text-gray-500 mt-1">
                      Miembro desde {formatDate(user.created_at)}
                    </p>
                  </div>
                </div>

                {/* Edit/Save Buttons */}
                {isOwnProfile && (
                  <div className="flex gap-2">
                    {editing ? (
                      <>
                        <button
                          onClick={handleSaveProfile}
                          className="btn btn-success"
                          data-testid="save-profile-button"
                        >
                          <Save size={20} />
                          Guardar
                        </button>
                        <button
                          onClick={() => {
                            setEditing(false);
                            fetchUserProfile();
                          }}
                          className="btn btn-secondary"
                          data-testid="cancel-edit-button"
                        >
                          <X size={20} />
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setEditing(true)}
                        className="btn btn-primary"
                        data-testid="start-edit-button"
                      >
                        <Edit2 size={20} />
                        Editar Perfil
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Info Column */}
            <div className="md:col-span-1">
              <div className="card">
                <h2 className="card-header">Información</h2>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="text-blue-600 mt-1 flex-shrink-0" size={20} />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-gray-800" data-testid="profile-email">{user.email}</p>
                    </div>
                  </div>

                  {editing ? (
                    <div className="flex items-start gap-3">
                      <Phone className="text-blue-600 mt-1 flex-shrink-0" size={20} />
                      <div className="flex-1">
                        <p className="text-sm text-gray-500 mb-1">Teléfono</p>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Número de teléfono"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          data-testid="phone-input"
                        />
                      </div>
                    </div>
                  ) : user.phone ? (
                    <div className="flex items-start gap-3">
                      <Phone className="text-blue-600 mt-1 flex-shrink-0" size={20} />
                      <div>
                        <p className="text-sm text-gray-500">Teléfono</p>
                        <p className="text-gray-800" data-testid="profile-phone">{user.phone}</p>
                      </div>
                    </div>
                  ) : null}

                  {editing ? (
                    <div className="flex items-start gap-3">
                      <MapPin className="text-blue-600 mt-1 flex-shrink-0" size={20} />
                      <div className="flex-1">
                        <p className="text-sm text-gray-500 mb-1">Ubicación</p>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Ciudad, País"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          data-testid="location-input"
                        />
                      </div>
                    </div>
                  ) : user.location ? (
                    <div className="flex items-start gap-3">
                      <MapPin className="text-blue-600 mt-1 flex-shrink-0" size={20} />
                      <div>
                        <p className="text-sm text-gray-500">Ubicación</p>
                        <p className="text-gray-800" data-testid="profile-location">{user.location}</p>
                      </div>
                    </div>
                  ) : null}

                  {user.role === 'admin' && (
                    <div className="flex items-start gap-3">
                      <Briefcase className="text-blue-600 mt-1 flex-shrink-0" size={20} />
                      <div>
                        <p className="text-sm text-gray-500">Rol</p>
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-700">
                          Administrador
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bio Column */}
            <div className="md:col-span-2">
              <div className="card">
                <h2 className="card-header">Sobre mí</h2>
                
                {editing ? (
                  <textarea
                    className="form-textarea"
                    placeholder="Cuéntanos sobre ti..."
                    rows={6}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    data-testid="bio-textarea"
                  />
                ) : user.bio ? (
                  <p className="text-gray-700 whitespace-pre-wrap" data-testid="profile-bio">
                    {user.bio}
                  </p>
                ) : (
                  <p className="text-gray-400 italic">
                    {isOwnProfile ? 'Añade información sobre ti...' : 'Este usuario no ha añadido una biografía.'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
