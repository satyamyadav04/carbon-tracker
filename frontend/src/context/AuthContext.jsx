import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/axios.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('carbon_token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('carbon_user')) || null);

  useEffect(() => {
    if (token) {
      localStorage.setItem('carbon_token', token);
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      localStorage.removeItem('carbon_token');
      delete api.defaults.headers.common.Authorization;
    }
  }, [token]);

  const login = (authToken, userData) => {
    setToken(authToken);
    setUser(userData);
    localStorage.setItem('carbon_user', JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('carbon_user');
    localStorage.removeItem('carbon_token');
  };

  const value = useMemo(() => ({ token, user, login, logout }), [token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
};
