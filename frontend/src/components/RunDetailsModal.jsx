import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Calendar, Clock, MapPin, CheckCircle, Zap, ShieldCheck } from 'lucide-react';

export default function RunDetailsModal({ runId, onClose, onRefresh }) {
  const { apiFetch, user, refreshUser } = useAuth();
  const [run, setRun] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  const fetchDetails = async () => {
    try {
      const res = await apiFetch(`/api/runs/${runId}`);
      if (res.ok) {
        const data = await res.json();
        setRun(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [runId]);

  const handleToggleAttendance = async (targetUserId, currentAttended) => {
    try {
      const res = await apiFetch(`/api/runs/${runId}/attendees/${targetUserId}/attendance`, {
        method: 'POST',
        body: JSON.stringify({ user_id: targetUserId, attended: !currentAttended }),
      });
      if (res.ok) {
        setActionMsg('Attendance updated!');
        setTimeout(() => setActionMsg(''), 2000);
        await fetchDetails();
        await refreshUser();
        if (onRefresh) onRefresh();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!runId) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <span className="badge badge-amber" style={{ marginBottom: '4px' }}>RUN ROSTER</span>
            <h2 style={{ fontSize: '26px', color: 'var(--fg)' }}>
              {run ? run.title : 'Loading...'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}
          >
            <X size={22} />
          </button>
        </div>

        {loading ? (
          <p style={{ color: 'var(--muted)' }}>Loading run details...</p>
        ) : run ? (
          <div>
            {/* Quick Summary */}
            <div style={{
              background: 'var(--raise)',
              padding: '14px',
              borderRadius: '12px',
              border: '1px solid var(--line)',
              marginBottom: '20px',
              fontSize: '13px',
              display: 'grid',
              gap: '6px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={14} color="var(--amber)" />
                <span>Date: <strong>{run.date}</strong> at <strong>{run.time}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={14} color="var(--arc-lite)" />
                <span>Location: <strong>{run.location}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={14} color="var(--ok)" />
                <span>Distance: <strong>{run.distance_km} KM</strong> • Paces: {run.pace_groups || 'Open'}</span>
              </div>
            </div>

            {/* Attendees Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '20px', color: 'var(--fg)' }}>
                Registered Runners ({run.attendees ? run.attendees.length : 0})
              </h3>
              {actionMsg && (
                <span style={{ fontSize: '12px', color: 'var(--ok)' }}>{actionMsg}</span>
              )}
            </div>

            {/* Attendees List */}
            {run.attendees && run.attendees.length > 0 ? (
              <div style={{ display: 'grid', gap: '10px' }}>
                {run.attendees.map((a) => {
                  const canCheckIn = user && (user.role === 'organizer' || user.id === a.user_id);
                  return (
                    <div
                      key={a.user_id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 14px',
                        background: 'var(--ink)',
                        border: '1px solid var(--line)',
                        borderRadius: '10px',
                        gap: '12px'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ color: 'var(--fg)', fontSize: '15px' }}>{a.name}</strong>
                          <span style={{ font: '700 11px var(--mono)', color: 'var(--amber)' }}>
                            {a.member_id}
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
                          Level: <span style={{ color: 'var(--arc-lite)' }}>{a.level || 'Beginner'}</span> • Goal: {a.goal || 'General Fitness'}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {a.attended ? (
                          <span className="badge badge-green" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle size={12} /> Attended
                          </span>
                        ) : (
                          <span className="badge badge-amber" style={{ opacity: 0.8 }}>
                            Registered
                          </span>
                        )}

                        {canCheckIn && (
                          <button
                            type="button"
                            className={`btn btn-sm ${a.attended ? 'btn-ghost' : 'btn-solid'}`}
                            style={{ padding: '0 10px', fontSize: '12px' }}
                            onClick={() => handleToggleAttendance(a.user_id, a.attended)}
                          >
                            {a.attended ? 'Mark Absent' : 'Mark Attended'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)', border: '1px dashed var(--line)', borderRadius: '10px' }}>
                No runners registered yet. Be the first to RSVP!
              </div>
            )}
          </div>
        ) : (
          <p style={{ color: 'var(--err)' }}>Run not found.</p>
        )}

        <div style={{ marginTop: '24px', textAlign: 'right' }}>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
