import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import RunCard from '../components/RunCard';
import RunDetailsModal from '../components/RunDetailsModal';
import CreateRunModal from '../components/CreateRunModal';
import { Plus, Calendar, Zap, Search, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function RunsPage({ onGoToRegister, onGoToLogin }) {
  const { user, apiFetch, refreshUser } = useAuth();
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRunId, setSelectedRunId] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [bannerMsg, setBannerMsg] = useState('');

  const fetchRuns = async () => {
    try {
      const res = await apiFetch('/api/runs');
      if (res.ok) {
        const data = await res.json();
        setRuns(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRuns();
  }, [user]);

  const handleRegister = async (runId) => {
    if (!user) {
      onGoToLogin();
      return;
    }
    try {
      const res = await apiFetch(`/api/runs/${runId}/register`, { method: 'POST' });
      if (res.ok) {
        // Trigger confetti celebration!
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#3d56f0', '#ffb627', '#8da0ff', '#ffffff']
        });
        setBannerMsg("You're registered for the run! See you at the starting line 🏃");
        setTimeout(() => setBannerMsg(''), 4000);
        await fetchRuns();
        await refreshUser();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCancel = async (runId) => {
    try {
      const res = await apiFetch(`/api/runs/${runId}/register`, { method: 'DELETE' });
      if (res.ok) {
        setBannerMsg('Registration cancelled.');
        setTimeout(() => setBannerMsg(''), 3000);
        await fetchRuns();
        await refreshUser();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCheckIn = async (runId, attended) => {
    if (!user) return;
    try {
      const res = await apiFetch(`/api/runs/${runId}/attendees/${user.id}/attendance`, {
        method: 'POST',
        body: JSON.stringify({ user_id: user.id, attended: attended }),
      });
      if (res.ok) {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#ffb627', '#7be0a6', '#3d56f0']
        });
        setBannerMsg('Attendance confirmed! Run added to your official stats ⚡');
        setTimeout(() => setBannerMsg(''), 4000);
        await fetchRuns();
        await refreshUser();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredRuns = runs.filter((r) => {
    if (activeFilter === 'upcoming' && r.status !== 'upcoming') return false;
    if (activeFilter === 'completed' && r.status !== 'completed') return false;
    if (activeFilter === 'my-rsvps' && !r.is_registered) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        r.title.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q) ||
        (r.pace_groups && r.pace_groups.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="wrap">
      {/* Header / Hero */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        flexWrap: 'wrap',
        gap: '24px',
        marginBottom: '32px'
      }}>
        <div>
          <p className="kicker">
            <svg viewBox="0 0 100 100" aria-hidden="true">
              <polygon points="62,0 15,58 45,58 32,100 88,38 55,38 75,0" />
            </svg>
            SURGE GROUP RUNS • FREE & OPEN TO ALL
          </p>
          <h1 style={{ font: '800 clamp(40px, 7vw, 64px)/.95 var(--display)', textTransform: 'uppercase' }}>
            UPCOMING RUNS
          </h1>
          <p style={{ margin: '10px 0 0', color: 'var(--muted)', maxWidth: '60ch', fontSize: '15px' }}>
            Group runs every week with dedicated pace leaders, hydration stops, and post-run community coffee. All fitness levels and paces are welcome.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {user?.role === 'organizer' && (
            <button
              type="button"
              className="btn btn-amber"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus size={18} /> Schedule New Run
            </button>
          )}

          {!user && (
            <button
              type="button"
              className="btn btn-amber"
              onClick={onGoToRegister}
            >
              <Zap size={18} /> Join Club & RSVP Free
            </button>
          )}
        </div>
      </div>

      {/* Toast Banner */}
      {bannerMsg && (
        <div style={{
          padding: '12px 18px',
          background: 'rgba(123, 224, 166, 0.15)',
          border: '1px solid var(--ok)',
          borderRadius: '12px',
          color: 'var(--ok)',
          marginBottom: '24px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle size={18} /> {bannerMsg}
        </div>
      )}

      {/* Filter & Search Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '14px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`btn btn-sm ${activeFilter === 'upcoming' ? 'btn-solid' : 'btn-ghost'}`}
            onClick={() => setActiveFilter('upcoming')}
          >
            Upcoming Runs
          </button>
          {user && (
            <button
              type="button"
              className={`btn btn-sm ${activeFilter === 'my-rsvps' ? 'btn-solid' : 'btn-ghost'}`}
              onClick={() => setActiveFilter('my-rsvps')}
            >
              My Registered Runs
            </button>
          )}
          <button
            type="button"
            className={`btn btn-sm ${activeFilter === 'completed' ? 'btn-solid' : 'btn-ghost'}`}
            onClick={() => setActiveFilter('completed')}
          >
            Past Runs
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeFilter === 'all' ? 'btn-solid' : 'btn-ghost'}`}
            onClick={() => setActiveFilter('all')}
          >
            All
          </button>
        </div>

        <div style={{ minWidth: '260px' }}>
          <input
            type="search"
            placeholder="Search run, park or pace..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Runs Grid */}
      {loading ? (
        <div className="panel" style={{ textAlign: 'center', padding: '60px' }}>
          <p style={{ color: 'var(--muted)', fontSize: '16px' }}>Loading Surge runs...</p>
        </div>
      ) : filteredRuns.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '20px'
        }}>
          {filteredRuns.map((run) => (
            <RunCard
              key={run.id}
              run={run}
              onRegister={handleRegister}
              onCancel={handleCancel}
              onCheckIn={handleCheckIn}
              onViewDetails={(id) => setSelectedRunId(id)}
              isOrganizer={user?.role === 'organizer'}
              currentUserId={user?.id}
            />
          ))}
        </div>
      ) : (
        <div className="panel" style={{ textAlign: 'center', padding: '60px' }}>
          <Calendar size={48} color="var(--line-lite)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '24px', color: 'var(--fg)', marginBottom: '8px' }}>
            No runs found
          </h3>
          <p style={{ color: 'var(--muted)', maxWidth: '40ch', margin: '0 auto 20px' }}>
            {activeFilter === 'my-rsvps'
              ? "You haven't registered for any upcoming runs yet. Click 'Register (Free)' on any run above!"
              : 'Try clearing your search or filter to see more group runs.'}
          </p>
          {activeFilter !== 'upcoming' && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => { setActiveFilter('upcoming'); setSearchQuery(''); }}
            >
              Reset Filters
            </button>
          )}
        </div>
      )}

      {/* Run Roster Modal */}
      {selectedRunId && (
        <RunDetailsModal
          runId={selectedRunId}
          onClose={() => setSelectedRunId(null)}
          onRefresh={fetchRuns}
        />
      )}

      {/* Create Run Modal */}
      <CreateRunModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={fetchRuns}
      />
    </div>
  );
}
