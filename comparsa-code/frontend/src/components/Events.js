import { useState, useEffect } from 'react';
import { api } from '../App';
import Navbar from './Navbar';
import { toast } from 'sonner';
import { Calendar as CalendarIcon, MapPin, Trash2, Plus, Users, Check, X } from 'lucide-react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

moment.locale('es');
const localizer = momentLocalizer(moment);

export default function Events({ user, onLogout }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewEvent, setShowNewEvent] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [attendances, setAttendances] = useState([]);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    location: '',
    start_date: '',
    end_date: '',
    category: 'general'
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await api.get('/events');
      setEvents(response.data);
    } catch (error) {
      toast.error('Error al cargar eventos');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendances = async (eventId) => {
    try {
      const response = await api.get(`/events/${eventId}/attendances`);
      setAttendances(response.data);
    } catch (error) {
      toast.error('Error al cargar asistencias');
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!newEvent.title.trim() || !newEvent.start_date || !newEvent.end_date) {
      toast.error('Complete todos los campos requeridos');
      return;
    }

    try {
      const response = await api.post('/events', newEvent);
      setEvents([...events, response.data]);
      setNewEvent({
        title: '',
        description: '',
        location: '',
        start_date: '',
        end_date: '',
        category: 'general'
      });
      setShowNewEvent(false);
      toast.success('¡Evento creado!');
    } catch (error) {
      toast.error('Error al crear evento');
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('¿Eliminar este evento?')) return;

    try {
      await api.delete(`/events/${id}`);
      setEvents(events.filter(e => e.id !== id));
      setSelectedEvent(null);
      toast.success('Evento eliminado');
    } catch (error) {
      toast.error('Error al eliminar evento. Solo administradores pueden eliminar eventos.');
    }
  };

  const handleAttendance = async (eventId, status) => {
    try {
      await api.post(`/events/${eventId}/attend`, { status });
      toast.success(`Asistencia marcada: ${status === 'attending' ? 'Asistiré' : status === 'maybe' ? 'Tal vez' : 'No asistiré'}`);
      if (selectedEvent && selectedEvent.id === eventId) {
        fetchAttendances(eventId);
      }
    } catch (error) {
      toast.error('Error al marcar asistencia');
    }
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    fetchAttendances(event.id);
  };

  const calendarEvents = events.map(event => ({
    id: event.id,
    title: event.title,
    start: new Date(event.start_date),
    end: new Date(event.end_date),
    resource: event
  }));

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const userAttendance = selectedEvent
    ? attendances.find(a => a.user_id === user.id)
    : null;

  return (
    <div data-testid="events-page">
      <Navbar user={user} onLogout={onLogout} />

      <div className="main-container">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <CalendarIcon className="text-blue-600" size={32} />
            Eventos
          </h1>
          <button
            onClick={() => setShowNewEvent(!showNewEvent)}
            className="btn btn-primary"
            data-testid="toggle-new-event-button"
          >
            <Plus size={20} />
            Nuevo Evento
          </button>
        </div>

        {/* Create Event Form */}
        {showNewEvent && (
          <div className="card mb-6" data-testid="new-event-form">
            <h2 className="card-header">Crear Nuevo Evento</h2>
            <form onSubmit={handleCreateEvent}>
              <div className="form-group">
                <label className="form-label">Título *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Título del evento"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  required
                  data-testid="new-event-title-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Descripción</label>
                <textarea
                  className="form-textarea"
                  placeholder="Descripción del evento"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  rows={3}
                  data-testid="new-event-description-textarea"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Ubicación</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ubicación del evento"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  data-testid="new-event-location-input"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Fecha y hora de inicio *</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={newEvent.start_date}
                    onChange={(e) => setNewEvent({ ...newEvent, start_date: e.target.value })}
                    required
                    data-testid="new-event-start-date-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Fecha y hora de fin *</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={newEvent.end_date}
                    onChange={(e) => setNewEvent({ ...newEvent, end_date: e.target.value })}
                    required
                    data-testid="new-event-end-date-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Categoría</label>
                <select
                  className="form-select"
                  value={newEvent.category}
                  onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                  data-testid="new-event-category-select"
                >
                  <option value="general">General</option>
                  <option value="rehearsal">Ensayo</option>
                  <option value="performance">Actuación</option>
                  <option value="meeting">Reunión</option>
                  <option value="social">Social</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button type="submit" className="btn btn-primary" data-testid="submit-event-button">
                  Crear Evento
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewEvent(false)}
                  className="btn btn-secondary"
                  data-testid="cancel-event-button"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="loading" data-testid="events-loading">Cargando eventos...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <div className="lg:col-span-2">
              <div className="calendar-container" data-testid="events-calendar">
                <Calendar
                  localizer={localizer}
                  events={calendarEvents}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: 600 }}
                  onSelectEvent={(event) => handleSelectEvent(event.resource)}
                  messages={{
                    next: 'Siguiente',
                    previous: 'Anterior',
                    today: 'Hoy',
                    month: 'Mes',
                    week: 'Semana',
                    day: 'Día',
                    agenda: 'Agenda',
                    date: 'Fecha',
                    time: 'Hora',
                    event: 'Evento',
                    noEventsInRange: 'No hay eventos en este rango'
                  }}
                />
              </div>
            </div>

            {/* Event Details */}
            <div>
              {selectedEvent ? (
                <div className="card" data-testid="event-details">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-800" data-testid="event-detail-title">
                      {selectedEvent.title}
                    </h3>
                    {user.role === 'admin' && (
                      <button
                        onClick={() => handleDeleteEvent(selectedEvent.id)}
                        className="text-gray-400 hover:text-red-500 transition"
                        data-testid="delete-event-button"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-start gap-2 text-gray-600">
                      <CalendarIcon size={18} className="mt-1 flex-shrink-0" />
                      <div className="text-sm">
                        <div>{formatDate(selectedEvent.start_date)}</div>
                        <div className="text-gray-500">hasta</div>
                        <div>{formatDate(selectedEvent.end_date)}</div>
                      </div>
                    </div>

                    {selectedEvent.location && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin size={18} className="flex-shrink-0" />
                        <span className="text-sm">{selectedEvent.location}</span>
                      </div>
                    )}

                    {selectedEvent.description && (
                      <p className="text-gray-600 text-sm mt-3" data-testid="event-detail-description">
                        {selectedEvent.description}
                      </p>
                    )}
                  </div>

                  {/* Attendance Buttons */}
                  <div className="border-t pt-4 mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">¿Asistirás?</p>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleAttendance(selectedEvent.id, 'attending')}
                        className={`btn text-sm ${
                          userAttendance?.status === 'attending'
                            ? 'btn-success'
                            : 'btn-secondary'
                        }`}
                        data-testid="attendance-attending-button"
                      >
                        <Check size={16} />
                        Sí
                      </button>
                      <button
                        onClick={() => handleAttendance(selectedEvent.id, 'maybe')}
                        className={`btn text-sm ${
                          userAttendance?.status === 'maybe'
                            ? 'btn-primary'
                            : 'btn-secondary'
                        }`}
                        data-testid="attendance-maybe-button"
                      >
                        Tal vez
                      </button>
                      <button
                        onClick={() => handleAttendance(selectedEvent.id, 'not_attending')}
                        className={`btn text-sm ${
                          userAttendance?.status === 'not_attending'
                            ? 'btn-danger'
                            : 'btn-secondary'
                        }`}
                        data-testid="attendance-not-attending-button"
                      >
                        <X size={16} />
                        No
                      </button>
                    </div>
                  </div>

                  {/* Attendees List */}
                  <div className="border-t pt-4" data-testid="attendees-section">
                    <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Users size={18} />
                      Asistentes ({attendances.filter(a => a.status === 'attending').length})
                    </p>
                    <div className="space-y-2">
                      {attendances
                        .filter(a => a.status === 'attending')
                        .map((attendance) => (
                          <div
                            key={attendance.id}
                            className="flex items-center gap-2 text-sm text-gray-600"
                            data-testid={`attendee-${attendance.user_id}`}
                          >
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center text-white text-xs font-semibold">
                              {attendance.user_name[0]}
                            </div>
                            {attendance.user_name}
                          </div>
                        ))}
                      {attendances.filter(a => a.status === 'attending').length === 0 && (
                        <p className="text-sm text-gray-400">No hay asistentes confirmados</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="card text-center text-gray-500" data-testid="no-event-selected">
                  <CalendarIcon size={48} className="mx-auto mb-3 opacity-30" />
                  <p>Selecciona un evento del calendario</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}