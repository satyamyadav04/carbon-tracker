import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
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
      const response = await api.post('/auth/register', form);
      login(response.data.token, {
        name: response.data.name,
        email: response.data.email,
        id: response.data._id,
        isAdmin: response.data.isAdmin,
      });
      window.dispatchEvent(new CustomEvent('carbonNotification', { detail: { message: 'Account created successfully!', variant: 'success' } }));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={handleSubmit}>
        <h2>Create Account</h2>
        {error && <div className="error-message">{error}</div>}
        <label>
          Full Name
          <input name="name" value={form.name} onChange={handleChange} required />
        </label>
        <label>
          Email
          <input name="email" type="email" value={form.email} onChange={handleChange} required />
        </label>
        <label>
          Password
          <input name="password" type="password" value={form.password} onChange={handleChange} required />
        </label>
        <button type="submit">Register</button>
        <p>
          Already registered? <Link to="/login">Login here</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
