import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Zap, Calendar, CreditCard, Users, LogOut, LogIn, UserPlus, Shield } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const { user, member, stats, logout } = useAuth();

  return (
    <header style={{
      borderBottom: '1px solid var(--line)',
      background: 'rgba(7, 11, 26, 0.92)',
      backdropFilter: 'blur(10px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '12px 20px'
    }}>
      <div style={{
        maxWidth: '1120px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        {/* Brand */}
        <div
          onClick={() => setActiveTab('runs')}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
        >
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '9px',
            background: 'var(--arc)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px var(--arc-glow)'
          }}>
            <Zap size={20} color="#ffb627" fill="#ffb627" />
          </div>
          <div>
            <div style={{
              font: '900 24px/0.9 var(--display)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: 'var(--fg)'
            }}>
              SURGE <span style={{ color: 'var(--amber)' }}>RUN CLUB</span>
            </div>
            <div style={{
              font: '700 10px/1 var(--mono)',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--arc-lite)'
            }}>
              EST. 2026 • EVERY RUN MATTERS
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'runs' ? 'btn-solid' : 'btn-ghost'}`}
            onClick={() => setActiveTab('runs')}
          >
            <Calendar size={15} />
            Upcoming Runs
          </button>

          {user && (
            <button
              type="button"
              className={`btn btn-sm ${activeTab === 'my-card' ? 'btn-solid' : 'btn-ghost'}`}
              onClick={() => setActiveTab('my-card')}
            >
              <CreditCard size={15} />
              My Runner Card
              {stats.runs_attended > 0 && (
                <span style={{
                  background: 'var(--amber)',
                  color: '#070b1a',
                  borderRadius: '10px',
                  padding: '1px 6px',
                  fontSize: '11px',
                  marginLeft: '4px'
                }}>
                  {stats.runs_attended}
                </span>
              )}
            </button>
          )}

          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'records' ? 'btn-solid' : 'btn-ghost'}`}
            onClick={() => setActiveTab('records')}
          >
            <Users size={15} />
            Member Records
          </button>
        </nav>

        {/* Auth / Profile Area */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                onClick={() => setActiveTab('my-card')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'var(--panel)',
                  border: '1px solid var(--line)',
                  borderRadius: '10px',
                  padding: '6px 12px',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'var(--amber)',
                  boxShadow: '0 0 8px var(--amber)'
                }} />
                <div style={{ fontSize: '13px' }}>
                  <div style={{ fontWeight: 600, color: 'var(--fg)', lineHeight: 1.2 }}>
                    {member ? member.name.split(' ')[0] : user.email.split('@')[0]}
                  </div>
                  <div style={{ font: '700 10px var(--mono)', color: 'var(--arc-lite)' }}>
                    {stats.badge.icon} {stats.runs_attended} {stats.runs_attended === 1 ? 'Run' : 'Runs'}
                  </div>
                </div>
                {user.role === 'organizer' && (
                  <span className="badge badge-amber" style={{ padding: '2px 5px', fontSize: '9px' }}>
                    <Shield size={10} /> LEAD
                  </span>
                )}
              </div>

              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={logout}
                title="Log out"
                style={{ padding: '0 10px' }}
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setActiveTab('login')}
              >
                <LogIn size={15} />
                Sign In
              </button>
              <button
                type="button"
                className="btn btn-amber btn-sm"
                onClick={() => setActiveTab('register')}
              >
                <UserPlus size={15} />
                Get Member Card
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
