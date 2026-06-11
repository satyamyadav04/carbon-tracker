import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const response = await api.post('/auth/login', form);
      login(response.data.token, {
        name: response.data.name,
        email: response.data.email,
        id: response.data._id,
        isAdmin: response.data.isAdmin,
      });
      window.dispatchEvent(new CustomEvent('carbonNotification', { detail: { message: 'Welcome back!', variant: 'success' } }));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={handleSubmit}>
        <h2>Login</h2>
        {error && <div className="error-message">{error}</div>}
        <label>
          Email
          <input name="email" type="email" value={form.email} onChange={handleChange} required />
        </label>
        <label>
          Password
          <input name="password" type="password" value={form.password} onChange={handleChange} required />
        </label>
        <button type="submit">Login</button>
        <p>
          New here? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
