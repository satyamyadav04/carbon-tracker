import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token automatically har request mein lagao
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // ya jahan bhi store kiya ho
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;