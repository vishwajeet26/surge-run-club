import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import MemberCard from '../components/MemberCard';
import { Zap, UserPlus, ArrowRight, ShieldCheck, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function RegisterPage({ onRegistered, onGoToLogin }) {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    goal: '5K Finisher',
    level: 'Beginner',
    health: 'None',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Live preview card data
  const previewMember = {
    id: 'SRG-26-NEW-MEMBER',
    name: formData.name.trim() || 'YOUR NAME HERE',
    phone: formData.phone.trim() || '9876543210',
    goal: formData.goal,
    level: formData.level,
    health: formData.health.trim() || 'None',
    issued_at: Date.now(),
  };

  const previewStats = {
    runs_attended: 0,
    badge: { title: 'Rookie Runner', icon: '🏃', tier: 'Rookie' }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(formData);
      // Confetti splash!
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.5 },
        colors: ['#3d56f0', '#ffb627', '#8da0ff', '#7be0a6']
      });
      onRegistered();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wrap">
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <p className="kicker">
          <svg viewBox="0 0 100 100" aria-hidden="true">
            <polygon points="62,0 15,58 45,58 32,100 88,38 55,38 75,0" />
          </svg>
          MEMBER ONBOARDING
        </p>
        <h1 style={{ font: '800 clamp(36px, 6vw, 56px)/0.95 var(--display)', textTransform: 'uppercase' }}>
          JOIN SURGE & MINT YOUR RUNNER CARD
        </h1>
        <p style={{ color: 'var(--muted)', maxWidth: '56ch', margin: '10px auto 0', fontSize: '15px' }}>
          Fill in your runner profile below to create your official digital pass, track attended runs, and register for weekly free group runs.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '40px',
        alignItems: 'start'
      }}>
        {/* Registration Form */}
        <div className="panel">
          <h2 style={{ fontSize: '24px', marginBottom: '18px', color: 'var(--fg)' }}>
            Runner Details
          </h2>

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
              <label>Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Rahul Sharma"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label>Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="rahul@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label>Password *</label>
                <input
                  type="password"
                  required
                  minLength="4"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label>WhatsApp Number (10 digits) *</label>
              <input
                type="text"
                required
                placeholder="9876543210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <span style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px', display: 'block' }}>
                Used for run reminders and community group updates.
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label>Running Goal</label>
                <select
                  value={formData.goal}
                  onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                >
                  <option value="5K Finisher">5K Finisher</option>
                  <option value="10K Finisher">10K Finisher</option>
                  <option value="Half Marathon">Half Marathon</option>
                  <option value="Full Marathon">Full Marathon</option>
                  <option value="Pace & Speed">Pace & Speed</option>
                  <option value="General Fitness">General Fitness</option>
                </select>
              </div>

              <div>
                <label>Running Experience</label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                >
                  <option value="Beginner">Beginner (New)</option>
                  <option value="Intermediate">Intermediate (1-3x/week)</option>
                  <option value="Advanced">Advanced (Fast/Marathon)</option>
                </select>
              </div>
            </div>

            <div>
              <label>Injuries or Health Notes</label>
              <input
                type="text"
                placeholder="e.g. None, or knee rehab, asthma, etc."
                value={formData.health}
                onChange={(e) => setFormData({ ...formData, health: e.target.value })}
              />
              <span style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px', display: 'block' }}>
                Helps our pace captains ensure your safety during runs.
              </span>
            </div>

            <button
              type="submit"
              className="btn btn-amber"
              disabled={loading}
              style={{ marginTop: '8px' }}
            >
              <UserPlus size={18} />
              {loading ? 'Minting Card...' : 'Generate Card & Join Club'}
            </button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px', color: 'var(--muted)' }}>
            Already have an account?{' '}
            <button
              type="button"
              className="link"
              onClick={onGoToLogin}
              style={{ color: 'var(--arc-lite)', fontWeight: 600 }}
            >
              Sign In here
            </button>
          </div>
        </div>

        {/* Live Card Preview */}
        <div>
          <div style={{ textAlign: 'center', marginBottom: '14px' }}>
            <span className="badge badge-amber">LIVE CARD PREVIEW</span>
            <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>
              Your official Member Pass updates in real time as you fill in your details!
            </p>
          </div>

          <MemberCard
            member={previewMember}
            stats={previewStats}
          />
        </div>
      </div>
    </div>
  );
}
