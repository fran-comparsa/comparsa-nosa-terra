import { Link, useLocation } from 'react-router-dom';
import { Home, Megaphone, Calendar, Settings, LogOut, User } from 'lucide-react';

export default function Navbar({ user, onLogout }) {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar" data-testid="main-navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand" data-testid="navbar-brand">
          Nosa Terra
        </Link>

        <div className="navbar-nav">
          <Link
            to="/"
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
            data-testid="nav-link-feed"
          >
            <Home size={20} />
            <span className="hidden sm:inline">Inicio</span>
          </Link>

          <Link
            to="/announcements"
            className={`nav-link ${isActive('/announcements') ? 'active' : ''}`}
            data-testid="nav-link-announcements"
          >
            <Megaphone size={20} />
            <span className="hidden sm:inline">Anuncios</span>
          </Link>

          <Link
            to="/events"
            className={`nav-link ${isActive('/events') ? 'active' : ''}`}
            data-testid="nav-link-events"
          >
            <Calendar size={20} />
            <span className="hidden sm:inline">Eventos</span>
          </Link>

          <Link
            to="/profile"
            className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
            data-testid="nav-link-profile"
          >
            <User size={20} />
            <span className="hidden sm:inline">Perfil</span>
          </Link>

          {user.role === 'admin' && (
            <Link
              to="/admin"
              className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
              data-testid="nav-link-admin"
            >
              <Settings size={20} />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          )}

          <button
            onClick={onLogout}
            className="nav-link"
            style={{ border: 'none', background: 'transparent' }}
            data-testid="logout-button"
          >
            <LogOut size={20} />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </div>
    </nav>
  );
}