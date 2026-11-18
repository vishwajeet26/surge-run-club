import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, Zap, UserPlus } from 'lucide-react';

export default function LoginPage({ onLoggedIn, onGoToRegister }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      onLoggedIn();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (quickEmail, quickPass) => {
    setEmail(quickEmail);
    setPassword(quickPass);
  };

  return (
    <div className="wrap" style={{ maxWidth: '480px' }}>
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <p className="kicker">
          <svg viewBox="0 0 100 100" aria-hidden="true">
            <polygon points="62,0 15,58 45,58 32,100 88,38 55,38 75,0" />
          </svg>
          SURGE ATHLETE ACCESS
        </p>
        <h1 style={{ font: '800 44px/0.95 var(--display)', textTransform: 'uppercase' }}>
          SIGN IN TO SURGE
        </h1>
        <p style={{ color: 'var(--muted)', marginTop: '8px', fontSize: '14px' }}>
          Access your digital runner card, run stats, and registrations.
        </p>
      </div>

      <div className="panel">
        {error && (
          <div style={{
            padding: '12px 14px',
            background: 'rgba(255, 154, 154, 0.1)',
            border: '1px solid var(--err)',
            borderRadius: '10px',
            color: 'var(--err)',
            marginBottom: '18px',
            fontSize: '13px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
          <div>
            <label>Email Address</label>
            <input
              type="email"
              required
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label>Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn btn-solid"
            disabled={loading}
            style={{ marginTop: '8px' }}
          >
            <LogIn size={18} />
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Fast Login Buttons */}
        <div style={{
          marginTop: '24px',
          paddingTop: '20px',
          borderTop: '1px solid var(--line)',
          textAlign: 'center'
        }}>
          <div style={{ font: '700 11px var(--mono)', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '10px' }}>
            Quick Demo Accounts
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => handleQuickLogin('rahul@example.com', 'member123')}
            >
              Runner: Rahul
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => handleQuickLogin('admin@surge.club', 'admin123')}
            >
              Organizer: Sohail
            </button>
          </div>
        </div>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px', color: 'var(--muted)' }}>
          Don't have a member card yet?{' '}
          <button
            type="button"
            className="link"
            onClick={onGoToRegister}
            style={{ color: 'var(--amber)', fontWeight: 600 }}
          >
            Join the club & generate card
          </button>
        </div>
      </div>
    </div>
  );
}
