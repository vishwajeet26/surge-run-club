import React from 'react';
import { Calendar, Clock, MapPin, Users, CheckCircle, Zap, ShieldCheck } from 'lucide-react';

export default function RunCard({ run, onRegister, onCancel, onCheckIn, onViewDetails, isOrganizer, currentUserId }) {
  const isUpcoming = run.status === 'upcoming';

  const formatRunDate = (dateStr) => {
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return {
        weekday: d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
        day: d.getDate(),
        month: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
      };
    } catch {
      return { weekday: 'RUN', day: '26', month: 'NOV' };
    }
  };

  const dObj = formatRunDate(run.date);

  return (
    <div className="panel" style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      position: 'relative',
      overflow: 'hidden',
      borderColor: run.is_registered ? 'var(--arc-lite)' : 'var(--line)',
      boxShadow: run.is_registered ? '0 8px 24px var(--arc-glow)' : 'none'
    }}>
      {/* Top Banner if registered */}
      {run.is_registered && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, var(--amber), var(--arc))'
        }} />
      )}

      <div>
        {/* Header with Date Badge & Distance */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '14px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {/* Date Block */}
            <div style={{
              background: 'var(--ink)',
              border: '1px solid var(--line)',
              borderRadius: '10px',
              padding: '6px 12px',
              textAlign: 'center',
              minWidth: '60px'
            }}>
              <div style={{ font: '700 11px var(--mono)', color: 'var(--amber)' }}>{dObj.weekday}</div>
              <div style={{ font: '800 24px/1 var(--display)', color: 'var(--fg)' }}>{dObj.day}</div>
              <div style={{ font: '700 10px var(--mono)', color: 'var(--muted)' }}>{dObj.month}</div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                <span className="badge badge-amber">FREE ENTRY</span>
                {run.status === 'completed' && <span className="badge badge-blue">COMPLETED</span>}
                {run.is_registered && (
                  <span className="badge badge-green">
                    <CheckCircle size={11} /> REGISTERED
                  </span>
                )}
                {run.is_attended && (
                  <span className="badge badge-amber">
                    <Zap size={11} /> ATTENDED
                  </span>
                )}
              </div>
              <h3 style={{ font: '800 24px/1.1 var(--display)', color: 'var(--fg)' }}>
                {run.title}
              </h3>
            </div>
          </div>

          <div style={{
            background: 'rgba(61, 86, 240, 0.15)',
            border: '1px solid var(--arc)',
            borderRadius: '10px',
            padding: '6px 12px',
            textAlign: 'right',
            flexShrink: 0
          }}>
            <div style={{ font: '800 22px/1 var(--display)', color: 'var(--fg)' }}>
              {run.distance_km} <span style={{ fontSize: '13px', color: 'var(--arc-lite)' }}>KM</span>
            </div>
            <div style={{ font: '700 10px var(--mono)', color: 'var(--muted)' }}>DISTANCE</div>
          </div>
        </div>

        {/* Info Grid */}
        <div style={{ display: 'grid', gap: '8px', marginBottom: '16px', fontSize: '13px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--muted)' }}>
            <Clock size={15} color="var(--arc-lite)" style={{ flexShrink: 0 }} />
            <span>Time: <strong style={{ color: 'var(--fg)' }}>{run.time}</strong></span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: 'var(--muted)' }}>
            <MapPin size={15} color="var(--amber)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>Location: <strong style={{ color: 'var(--fg)' }}>{run.location}</strong></span>
          </div>

          {run.pace_groups && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--muted)' }}>
              <Zap size={15} color="var(--arc-lite)" style={{ flexShrink: 0 }} />
              <span>Paces: <strong style={{ color: 'var(--fg)' }}>{run.pace_groups}</strong></span>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--muted)' }}>
            <Users size={15} color="var(--ok)" style={{ flexShrink: 0 }} />
            <span>
              <strong style={{ color: 'var(--fg)' }}>{run.attendees_count}</strong> {run.attendees_count === 1 ? 'runner' : 'runners'} registered
            </span>
          </div>
        </div>

        {run.description && (
          <p style={{
            fontSize: '13px',
            color: 'var(--muted)',
            margin: '0 0 16px 0',
            lineHeight: 1.5,
            borderLeft: '2px solid var(--line)',
            paddingLeft: '10px'
          }}>
            {run.description}
          </p>
        )}
      </div>

      {/* Action Footer */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '10px',
        paddingTop: '16px',
        borderTop: '1px solid var(--line)',
        flexWrap: 'wrap'
      }}>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => onViewDetails(run.id)}
        >
          <Users size={14} /> View Runners ({run.attendees_count})
        </button>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {isUpcoming ? (
            run.is_registered ? (
              <>
                {!run.is_attended ? (
                  <button
                    type="button"
                    className="btn btn-amber btn-sm"
                    onClick={() => onCheckIn(run.id, true)}
                    title="Mark yourself as attended for this run"
                  >
                    <CheckCircle size={14} /> Check In / Attended
                  </button>
                ) : (
                  <span className="badge badge-amber" style={{ padding: '6px 12px' }}>
                    <Zap size={13} /> Attended!
                  </span>
                )}

                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{ color: 'var(--err)', fontSize: '13px' }}
                  onClick={() => onCancel(run.id)}
                  title="Cancel your RSVP"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                className="btn btn-solid btn-sm"
                onClick={() => onRegister(run.id)}
              >
                <Zap size={14} /> Register (Free)
              </button>
            )
          ) : (
            <span style={{ fontSize: '13px', color: 'var(--muted)', fontStyle: 'italic' }}>
              Run concluded
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
