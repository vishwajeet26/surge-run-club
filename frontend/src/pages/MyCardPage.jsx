import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import MemberCard from '../components/MemberCard';
import { Calendar, CheckCircle, Zap, Award, Edit3, X, MapPin } from 'lucide-react';

export default function MyCardPage({ onGoToRuns }) {
  const { user, member, stats, apiFetch, updateMember, refreshUser } = useAuth();
  const [cardData, setCardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    goal: '5K Finisher',
    level: 'Beginner',
    health: 'None',
  });
  const [editLoading, setEditLoading] = useState(false);

  const fetchCardDetails = async () => {
    try {
      const res = await apiFetch('/api/members/me');
      if (res.ok) {
        const data = await res.json();
        setCardData(data);
        if (data.member) {
          setEditForm({
            name: data.member.name || '',
            phone: data.member.phone || '',
            goal: data.member.goal || '5K Finisher',
            level: data.member.level || 'Beginner',
            health: data.member.health || 'None',
          });
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCardDetails();
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      await updateMember(editForm);
      await fetchCardDetails();
      await refreshUser();
      setIsEditModalOpen(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setEditLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="wrap" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h2>Sign in to view your member card</h2>
      </div>
    );
  }

  const currentMember = cardData?.member || member;
  const currentStats = cardData?.stats || stats;
  const attendedRuns = cardData?.attended_runs || [];
  const upcomingRuns = cardData?.upcoming_runs || [];

  const totalKmRun = attendedRuns.reduce((acc, r) => acc + (r.distance_km || 0), 0);

  return (
    <div className="wrap">
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <p className="kicker">
          <svg viewBox="0 0 100 100" aria-hidden="true">
            <polygon points="62,0 15,58 45,58 32,100 88,38 55,38 75,0" />
          </svg>
          SURGE ATHLETE IDENTITY
        </p>
        <h1 style={{ font: '800 clamp(36px, 6vw, 56px)/0.95 var(--display)', textTransform: 'uppercase' }}>
          OFFICIAL MEMBER CARD
        </h1>
        <p style={{ color: 'var(--muted)', marginTop: '8px', fontSize: '15px' }}>
          Your permanent Surge membership badge. Show this at group run check-ins and track your milestone participation.
        </p>
      </div>

      {/* Hero Layout: Card + Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '36px',
        alignItems: 'start',
        marginBottom: '48px'
      }}>
        {/* Digital Card */}
        <div>
          <MemberCard
            member={currentMember}
            stats={currentStats}
            onEdit={() => setIsEditModalOpen(true)}
          />
        </div>

        {/* Runner Milestone Dashboard */}
        <div style={{ display: 'grid', gap: '16px' }}>
          <div className="panel" style={{ background: 'var(--raise)', border: '1px solid var(--line-lite)' }}>
            <span className="badge badge-amber" style={{ marginBottom: '8px' }}>PARTICIPATION STATS</span>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px',
              marginTop: '12px',
              textAlign: 'center'
            }}>
              <div style={{ background: 'var(--ink)', padding: '14px', borderRadius: '10px', border: '1px solid var(--line)' }}>
                <div style={{ font: '800 36px/1 var(--display)', color: 'var(--arc-lite)' }}>
                  {currentStats.runs_attended}
                </div>
                <div style={{ font: '700 10px var(--mono)', color: 'var(--muted)', marginTop: '4px' }}>
                  RUNS ATTENDED
                </div>
              </div>

              <div style={{ background: 'var(--ink)', padding: '14px', borderRadius: '10px', border: '1px solid var(--line)' }}>
                <div style={{ font: '800 36px/1 var(--display)', color: 'var(--amber)' }}>
                  {totalKmRun}
                </div>
                <div style={{ font: '700 10px var(--mono)', color: 'var(--muted)', marginTop: '4px' }}>
                  KM COMPLETED
                </div>
              </div>

              <div style={{ background: 'var(--ink)', padding: '14px', borderRadius: '10px', border: '1px solid var(--line)' }}>
                <div style={{ font: '800 36px/1 var(--display)', color: 'var(--ok)' }}>
                  {upcomingRuns.length}
                </div>
                <div style={{ font: '700 10px var(--mono)', color: 'var(--muted)', marginTop: '4px' }}>
                  UPCOMING RSVPS
                </div>
              </div>
            </div>

            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--muted)' }}>
              <Zap size={16} color="var(--amber)" />
              <span>
                Current Tier: <strong style={{ color: 'var(--fg)' }}>{currentStats.badge.title}</strong> ({currentStats.badge.desc})
              </span>
            </div>
          </div>

          {/* Quick Action: Register for next run */}
          <div className="panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <h3 style={{ fontSize: '20px', color: 'var(--fg)' }}>Ready for your next run?</h3>
              <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: '13px' }}>
                Group runs are 100% free with hydration and pace pacers.
              </p>
            </div>
            <button type="button" className="btn btn-amber btn-sm" onClick={onGoToRuns}>
              Browse Group Runs
            </button>
          </div>
        </div>
      </div>

      {/* History & Upcoming Sections */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '28px' }}>
        {/* Attended Runs History */}
        <div className="panel">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '22px', color: 'var(--fg)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={18} color="var(--ok)" /> Attended Runs History ({attendedRuns.length})
            </h3>
          </div>

          {attendedRuns.length > 0 ? (
            <div style={{ display: 'grid', gap: '10px' }}>
              {attendedRuns.map((r) => (
                <div
                  key={r.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    background: 'var(--ink)',
                    borderRadius: '10px',
                    border: '1px solid var(--line)',
                    gap: '12px'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--fg)' }}>{r.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                      <Calendar size={12} /> {r.date} • <MapPin size={12} /> {r.location}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span className="badge badge-green">
                      {r.distance_km} KM • Attended
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)', border: '1px dashed var(--line)', borderRadius: '10px', fontSize: '14px' }}>
              No attended runs recorded yet. Join our upcoming Saturday run and check in with the run lead to earn your first attendance badge!
            </div>
          )}
        </div>

        {/* Upcoming RSVPs */}
        <div className="panel">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '22px', color: 'var(--fg)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={18} color="var(--arc-lite)" /> Upcoming Registered Runs ({upcomingRuns.length})
            </h3>
          </div>

          {upcomingRuns.length > 0 ? (
            <div style={{ display: 'grid', gap: '10px' }}>
              {upcomingRuns.map((r) => (
                <div
                  key={r.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    background: 'var(--ink)',
                    borderRadius: '10px',
                    border: '1px solid var(--line)',
                    gap: '12px'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--fg)' }}>{r.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                      <Calendar size={12} /> {r.date} at {r.time}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span className="badge badge-amber">
                      {r.distance_km} KM
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)', border: '1px dashed var(--line)', borderRadius: '10px', fontSize: '14px' }}>
              You haven't registered for any upcoming runs yet.{' '}
              <button
                type="button"
                className="link"
                onClick={onGoToRuns}
                style={{ color: 'var(--arc-lite)' }}
              >
                Browse runs here
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h2 style={{ fontSize: '24px', color: 'var(--fg)' }}>Update Card Details</h2>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} style={{ display: 'grid', gap: '14px' }}>
              <div>
                <label>Runner Name</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>

              <div>
                <label>WhatsApp Number</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label>Running Goal</label>
                  <select
                    value={editForm.goal}
                    onChange={(e) => setEditForm({ ...editForm, goal: e.target.value })}
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
                  <label>Running Level</label>
                  <select
                    value={editForm.level}
                    onChange={(e) => setEditForm({ ...editForm, level: e.target.value })}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label>Injuries or Health Notes</label>
                <input
                  type="text"
                  value={editForm.health}
                  onChange={(e) => setEditForm({ ...editForm, health: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-solid" disabled={editLoading}>
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
