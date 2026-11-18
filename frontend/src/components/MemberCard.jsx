import React, { useState } from 'react';
import { Zap, QrCode, Phone, Heart, Award, Copy, Check, Flame, Calendar } from 'lucide-react';

export default function MemberCard({ member, stats, onEdit }) {
  const [copied, setCopied] = useState(false);

  if (!member) {
    return (
      <div className="panel" style={{ textAlign: 'center', padding: '40px' }}>
        <p style={{ color: 'var(--muted)' }}>No member card generated yet.</p>
      </div>
    );
  }

  const copyId = () => {
    navigator.clipboard.writeText(member.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasHealth = member.health && !/^(none|no|nil|nothing|n\/a|na|nope|-|—)?$/i.test(member.health.trim());
  const runsCount = stats?.runs_attended ?? 0;
  const badge = stats?.badge || { title: 'Rookie Runner', icon: '🏃', tier: 'Rookie' };

  const formatDate = (ms) => {
    if (!ms) return 'ACTIVE';
    try {
      return new Date(ms).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
    } catch {
      return 'ACTIVE';
    }
  };

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', width: '100%' }}>
      <div className="runner-card">
        {/* Card Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '6px',
                background: 'var(--amber)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Zap size={15} color="#070b1a" fill="#070b1a" />
              </div>
              <span style={{ font: '900 18px var(--display)', letterSpacing: '0.06em', color: 'var(--fg)' }}>
                SURGE RUN CLUB
              </span>
            </div>
            <div style={{ font: '700 10px var(--mono)', color: 'var(--arc-lite)', letterSpacing: '0.12em' }}>
              OFFICIAL ATHLETE PASS • 2026
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span className="badge badge-amber" style={{ fontSize: '11px' }}>
              {badge.icon} {badge.title}
            </span>
          </div>
        </div>

        {/* Member Name & ID */}
        <div style={{ marginBottom: '22px' }}>
          <div style={{
            font: '800 clamp(32px, 6vw, 42px)/1.0 var(--display)',
            textTransform: 'uppercase',
            letterSpacing: '0.02em',
            color: '#fff',
            textShadow: '0 2px 10px rgba(0,0,0,0.5)',
            marginBottom: '6px'
          }}>
            {member.name}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              font: '700 16px/1.2 var(--mono)',
              color: 'var(--amber)',
              background: 'rgba(255, 182, 39, 0.1)',
              padding: '4px 10px',
              borderRadius: '6px',
              border: '1px dashed rgba(255, 182, 39, 0.4)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span>{member.id}</span>
              <button
                type="button"
                onClick={copyId}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--amber)', padding: 0 }}
                title="Copy Member ID"
              >
                {copied ? <Check size={14} color="var(--ok)" /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        </div>

        {/* Runs Attended Milestone Bar */}
        <div style={{
          background: 'var(--raise)',
          border: '1px solid var(--line)',
          borderRadius: '12px',
          padding: '14px 16px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}>
          <div>
            <div style={{ font: '700 11px var(--mono)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Club Participation
            </div>
            <div style={{ font: '800 28px/1 var(--display)', color: 'var(--fg)', marginTop: '2px' }}>
              <span style={{ color: 'var(--arc-lite)' }}>{runsCount}</span>{' '}
              <span style={{ fontSize: '18px', color: 'var(--muted)' }}>
                {runsCount === 1 ? 'RUN ATTENDED' : 'RUNS ATTENDED'}
              </span>
            </div>
          </div>

          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: runsCount > 0 ? 'rgba(61, 86, 240, 0.25)' : 'rgba(255, 255, 255, 0.05)',
            border: `2px solid ${runsCount > 0 ? 'var(--arc-lite)' : 'var(--line)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px'
          }}>
            {runsCount >= 10 ? '🌟' : runsCount >= 4 ? '🏆' : runsCount >= 1 ? '⚡' : '👟'}
          </div>
        </div>

        {/* Details Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          marginBottom: '20px',
          fontSize: '13px'
        }}>
          <div style={{ background: 'rgba(7, 11, 26, 0.6)', padding: '10px 12px', borderRadius: '8px' }}>
            <div style={{ font: '700 10px var(--mono)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Target Goal
            </div>
            <div style={{ fontWeight: 600, color: 'var(--fg)', marginTop: '3px' }}>
              {member.goal || 'General Fitness'}
            </div>
          </div>

          <div style={{ background: 'rgba(7, 11, 26, 0.6)', padding: '10px 12px', borderRadius: '8px' }}>
            <div style={{ font: '700 10px var(--mono)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Pace / Level
            </div>
            <div style={{ fontWeight: 600, color: 'var(--arc-lite)', marginTop: '3px' }}>
              {member.level || 'Beginner'}
            </div>
          </div>

          <div style={{ background: 'rgba(7, 11, 26, 0.6)', padding: '10px 12px', borderRadius: '8px' }}>
            <div style={{ font: '700 10px var(--mono)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              WhatsApp Phone
            </div>
            <div style={{ fontWeight: 600, marginTop: '3px' }}>
              {member.phone ? (
                <a
                  href={`https://wa.me/${member.phone.length === 10 ? '91' : ''}${member.phone}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'var(--fg)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Phone size={12} color="var(--ok)" /> +91 {member.phone}
                </a>
              ) : (
                <span style={{ color: 'var(--muted)' }}>Not provided</span>
              )}
            </div>
          </div>

          <div style={{ background: 'rgba(7, 11, 26, 0.6)', padding: '10px 12px', borderRadius: '8px' }}>
            <div style={{ font: '700 10px var(--mono)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Issued Date
            </div>
            <div style={{ fontWeight: 600, color: 'var(--fg)', marginTop: '3px' }}>
              {formatDate(member.issued_at || member.added_at)}
            </div>
          </div>
        </div>

        {/* Health Notes Flag */}
        {hasHealth && (
          <div style={{
            background: 'rgba(255, 182, 39, 0.08)',
            border: '1px solid rgba(255, 182, 39, 0.25)',
            borderRadius: '8px',
            padding: '10px 12px',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            fontSize: '12px'
          }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--amber)', marginTop: '4px', flexShrink: 0 }} />
            <div>
              <span style={{ font: '700 11px var(--mono)', color: 'var(--amber)', textTransform: 'uppercase' }}>
                Health & Safety Note:
              </span>{' '}
              <span style={{ color: 'var(--fg)' }}>{member.health}</span>
            </div>
          </div>
        )}

        {/* Card Footer Barcode & QR Simulation */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid var(--line)',
          paddingTop: '16px',
          marginTop: '8px'
        }}>
          <div>
            <div style={{ font: '700 9px var(--mono)', color: 'var(--muted)', letterSpacing: '0.15em' }}>
              AUTHORIZED SURGE ATHLETE
            </div>
            <div style={{ font: '500 11px var(--mono)', color: 'var(--arc-lite)' }}>
              PASS://RUN-CLUB/{member.id}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <QrCode size={36} color="var(--fg)" />
          </div>
        </div>
      </div>

      {onEdit && (
        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onEdit}>
            Edit Card Details
          </button>
        </div>
      )}
    </div>
  );
}
