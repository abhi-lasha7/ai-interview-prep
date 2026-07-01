import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, loading } = useAuthStore();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    targetRole: '',
    experienceLevel: 'fresher'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error('Please fill all required fields');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    const result = await register(form);
    if (result.success) {
      toast.success('Account created! Let\'s practice 🚀');
      navigate('/dashboard');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: '#0f0f1a', padding: '20px'
    }}>
      <div className="glass" style={{
        width: '100%', maxWidth: '460px',
        padding: '48px 40px', borderRadius: '24px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '40px', marginBottom: '8px' }}>🎯</div>
          <h1 style={{ fontSize: '28px', fontWeight: '800' }}>Create your account</h1>
          <p style={{ color: '#94a3b8', marginTop: '8px' }}>Start practicing interviews for free</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#94a3b8' }}>
              Full Name *
            </label>
            <input
              type="text"
              placeholder="Abhilasha Gavhane"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#94a3b8' }}>
              Email Address *
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#94a3b8' }}>
              Password *
            </label>
            <input
              type="password"
              placeholder="Min 6 characters"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#94a3b8' }}>
              Target Job Role
            </label>
            <input
              type="text"
              placeholder="e.g. Full Stack Developer, Data Scientist"
              value={form.targetRole}
              onChange={(e) => setForm({ ...form, targetRole: e.target.value })}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#94a3b8' }}>
              Experience Level
            </label>
            <select
              value={form.experienceLevel}
              onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })}
            >
              <option value="fresher">Fresher (0-1 years)</option>
              <option value="junior">Junior (1-3 years)</option>
              <option value="mid">Mid Level (3-5 years)</option>
              <option value="senior">Senior (5+ years)</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ marginTop: '8px', opacity: loading ? 0.7 : 1 }}
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Account →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', color: '#94a3b8' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#667eea', fontWeight: '600', textDecoration: 'none' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}