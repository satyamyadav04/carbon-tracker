import { useMemo, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Activities from './pages/Activities.jsx';
import Reports from './pages/Reports.jsx';
import Chat from './pages/Chat.jsx';
import AdminPanel from './pages/AdminPanel.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import NotificationToast from './components/NotificationToast.jsx';
import './App.css';

function App() {
  const [theme, setTheme] = useState('light');

  const themeClass = useMemo(() => (theme === 'dark' ? 'theme-dark' : 'theme-light'), [theme]);

  return (
    <AuthProvider>
      <div className={`app-shell ${themeClass}`}>
        <BrowserRouter>
          <Navbar theme={theme} onToggleTheme={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))} />
          <div className="layout-grid">
            <Sidebar />
            <main className="app-main">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/activities" element={<ProtectedRoute><Activities /></ProtectedRoute>} />
                <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
                <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
                <Route path="*" element={<div className="empty-state">Page not found</div>} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
        <NotificationToast />
      </div>
    </AuthProvider>
  );
}

export default App;
