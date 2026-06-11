import { useAuth } from '../context/AuthContext.jsx';

const Navbar = ({ onToggleTheme, theme }) => {
  const { user, logout } = useAuth();

  return (
    <header className="navbar app-header">
      <div className="navbar-brand brand">
        <span className="brand-logo" aria-hidden />
        <span>Carbon Tracker</span>
      </div>
      <div className="navbar-actions">
        <button className="primary-btn" type="button" onClick={onToggleTheme}>
          {theme === 'dark' ? 'Light' : 'Dark'}
        </button>
        <span className="nav-user">{user?.name || 'Guest'}</span>
        <button className="nav-button" type="button" onClick={logout}>
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;
