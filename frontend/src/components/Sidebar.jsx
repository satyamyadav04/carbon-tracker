import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Sidebar = () => {
  const { user } = useAuth();

  return (
    <aside className="sidebar">
      <nav>
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/activities">Activities</NavLink>
        <NavLink to="/reports">Reports</NavLink>
        <NavLink to="/chat">AI Chat</NavLink>
        {user?.isAdmin && <NavLink to="/admin">Admin Panel</NavLink>}
      </nav>
    </aside>
  );
};

export default Sidebar;
