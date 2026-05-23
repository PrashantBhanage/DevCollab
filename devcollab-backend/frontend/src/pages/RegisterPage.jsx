import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const register = useAuthStore((state) => state.register);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register({ username: name, email, password }); // Assuming backend expects 'username' or 'name'. Backend AuthRequest model expects username. Let's use username for backend mapping.
      await login({ email, password });
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="card w-full" style={{ maxWidth: '400px' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: '600' }}>Create an account</h1>
        <form onSubmit={handleSubmit} className="flex-col gap-4">
          <div className="flex-col gap-2">
            <label htmlFor="name" style={{ fontSize: '0.9rem', fontWeight: '500' }}>Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              required
            />
          </div>
          <div className="flex-col gap-2">
            <label htmlFor="email" style={{ fontSize: '0.9rem', fontWeight: '500' }}>Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="flex-col gap-2">
            <label htmlFor="password" style={{ fontSize: '0.9rem', fontWeight: '500' }}>Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading} style={{ marginTop: '0.5rem' }}>
            {loading ? 'Creating account...' : 'Sign up'}
          </button>
        </form>
        <p style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
          Already have an account? <Link to="/" style={{ fontWeight: '500' }}>Log in</Link>
        </p>
      </div>
    </div>
  );
}
