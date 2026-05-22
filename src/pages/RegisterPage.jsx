import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import toast from 'react-hot-toast';

function RegisterPage() {
  const navigate = useNavigate();
  const { register, loading, error, clearError } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    
    if (!name || !email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    const success = await register(name, email, password);
    if (success) {
      toast.success('Account created!');
      navigate('/dashboard');
    } else {
      toast.error(error || 'Registration failed');
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <h1>Create account</h1>
        <p>Start collaborating with your team</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              type="text"
              className="form-input"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? <span className="loading-spinner" /> : 'Create account'}
          </button>
        </form>
        
        <p style={{ marginTop: '24px', textAlign: 'center' }}>
          Already have an account?{' '}
          <Link to="/" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;