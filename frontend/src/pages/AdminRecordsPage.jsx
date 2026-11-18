import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Download, Search, Trash2, CheckCircle, AlertTriangle, Phone, Zap } from 'lucide-react';

export default function AdminRecordsPage() {
  const { apiFetch, user } = useAuth();
  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState(null);
  const [pasteText, setPasteText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [pasteLoading, setPasteLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [pendingRemove, setPendingRemove] = useState(null);

  const NONE_REGEX = /^(none|no|nil|nothing|n\/a|na|nope|-|—)\.?$/i;

  const fetchData = async () => {
    try {
      const [membersRes, statsRes] = await Promise.all([
        apiFetch('/api/members'),
        apiFetch('/api/stats')
      ]);
      if (membersRes.ok) {
        const mData = await membersRes.json();
        setMembers(mData);
      }
      if (statsRes.ok) {
        const sData = await statsRes.json();
        setStats(sData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleAddBatch = async () => {
    if (!pasteText.trim()) return;
    setPasteLoading(true);
    setMsg({ text: '', type: '' });
    try {
      const res = await apiFetch('/api/members/batch-whatsapp', {
        method: 'POST',
        body: JSON.stringify({ text: pasteText }),
      });
      if (res.ok) {
        const data = await res.json();
        const parts = [];
        parts.push(`Added ${data.added} ${data.added === 1 ? 'member' : 'members'}.`);
        if (data.duplicates) parts.push(`${data.duplicates} already in records.`);
        if (data.skipped) parts.push(`${data.skipped} without Member ID skipped.`);
        setMsg({ text: parts.join(' '), type: data.added > 0 ? 'ok' : 'bad' });
        if (data.added > 0) setPasteText('');
        await fetchData();
      } else {
        const err = await res.json();
        setMsg({ text: err.detail || 'Failed to add registrations.', type: 'bad' });
      }
    } catch (e) {
      setMsg({ text: 'Error connecting to backend.', type: 'bad' });
    } finally {
      setPasteLoading(false);
    }
  };

  const handleRemove = async (id) => {
    try {
      const res = await apiFetch(`/api/members/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setPendingRemove(null);
        setMsg({ text: `Removed ${id}.`, type: 'ok' });
        await fetchData();
      } else {
        const err = await res.json();
        alert(err.detail || 'Could not delete member');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownloadCsv = () => {
    if (!members.length) return;
    const rows = [['Issued', 'Name', 'Member ID', 'WhatsApp', 'Goal', 'Level', 'Health notes', 'Runs Attended']];
    members.forEach((m) => {
      const issued = m.issued_at ? new Date(m.issued_at).toISOString().slice(0, 10) : '';
      rows.push([
        issued,
        m.name || '',
        m.id || '',
        m.phone || '',
        m.goal || '',
        m.level || '',
        m.health || '',
        m.runs_attended || 0,
      ]);
    });

    const csvContent = '\uFEFF' + rows.map((r) => r.map((c) => {
      let v = String(c == null ? '' : c);
      if (/^[=+\-@]/.test(v)) v = "'" + v;
      return /[",\n\r]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
    }).join(',')).join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `surge-members-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const hasHealth = (m) => {
    const h = (m.health || '').trim();
    return !!h && !NONE_REGEX.test(h);
  };

  const filteredMembers = members.filter((m) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (m.name && m.name.toLowerCase().includes(q)) ||
      (m.id && m.id.toLowerCase().includes(q)) ||
      (m.phone && m.phone.includes(q)) ||
      (m.goal && m.goal.toLowerCase().includes(q)) ||
      (m.level && m.level.toLowerCase().includes(q))
    );
  });

  const formatDate = (ms) => {
    if (!ms) return '—';
    try {
      return new Date(ms).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return '—';
    }
  };

  const goalsList = stats?.by_goal || [];
  const maxGoalCount = goalsList.length ? goalsList[0].cnt : 1;

  return (
    <div className="wrap">
      {/* Header Breakdown */}
      <header className="head" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '32px 48px',
        alignItems: 'end',
        marginBottom: '36px'
      }}>
        <div>
          <p className="kicker">
            <svg viewBox="0 0 100 100" aria-hidden="true">
              <polygon points="62,0 15,58 45,58 32,100 88,38 55,38 75,0" />
            </svg>
            SURGE CLUB ROSTER
          </p>
          <h1 style={{ font: '800 clamp(40px, 7vw, 64px)/.95 var(--display)', textTransform: 'uppercase' }}>
            MEMBER RECORDS
          </h1>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px', flexWrap: 'wrap', marginTop: '16px' }}>
            <p style={{ margin: 0, font: '800 clamp(72px, 14vw, 130px)/.8 var(--display)', fontVariantNumeric: 'tabular-nums', color: 'var(--fg)' }}>
              {members.length}
            </p>
            <p style={{ margin: 0, font: '700 13px/1.3 var(--mono)', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--muted)' }}>
              members<br />registered
            </p>
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', marginBottom: '18px' }}>
            <div>
              <div style={{ font: '800 40px/1 var(--display)', fontVariantNumeric: 'tabular-nums', color: 'var(--fg)' }}>
                {stats?.recent_week_members ?? 0}
              </div>
              <span style={{ fontSize: '13px', color: 'var(--muted)' }}>added in the last 7 days</span>
            </div>
            <div>
              <div style={{ font: '800 40px/1 var(--display)', fontVariantNumeric: 'tabular-nums', color: 'var(--amber)' }}>
                {stats?.health_notes_members ?? 0}
              </div>
              <span style={{ fontSize: '13px', color: 'var(--muted)' }}>with injury or health notes</span>
            </div>
            <div>
              <div style={{ font: '800 40px/1 var(--display)', fontVariantNumeric: 'tabular-nums', color: 'var(--arc-lite)' }}>
                {stats?.total_attendances ?? 0}
              </div>
              <span style={{ fontSize: '13px', color: 'var(--muted)' }}>total run attendances</span>
            </div>
          </div>

          {/* Goal Distribution Bars */}
          <div style={{ display: 'grid', gap: '8px' }}>
            {goalsList.slice(0, 4).map((g) => {
              const widthPct = Math.max(6, Math.round((g.cnt / maxGoalCount) * 100));
              return (
                <div
                  key={g.goal}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 150px) minmax(0, 1fr) 28px',
                    gap: '12px',
                    alignItems: 'center',
                    fontSize: '13px'
                  }}
                >
                  <span style={{ color: 'var(--muted)', overflowWrap: 'anywhere' }}>{g.goal}</span>
                  <div style={{ height: '8px', background: 'var(--panel)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: 'var(--arc)', borderRadius: '4px', width: `${widthPct}%` }} />
                  </div>
                  <span style={{ font: '700 13px var(--mono)', textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: 'var(--fg)' }}>
                    {g.cnt}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </header>

      {/* WhatsApp Message Paste Importer */}
      <section className="panel" style={{ marginBottom: '36px' }}>
        <h2 style={{ fontSize: '26px', color: 'var(--fg)' }}>Add registrations via WhatsApp</h2>
        <p style={{ margin: '6px 0 14px', fontSize: '14px', color: 'var(--muted)', maxWidth: '64ch' }}>
          Paste the WhatsApp messages members send you, one or many at once. Each registration needs its Member ID line. People already in your records are skipped.
        </p>

        <textarea
          rows="5"
          placeholder={`Hi Surge! I just registered.\nName: Rahul Sharma\nMember ID: SRG-26-K7M4-Q2XH\nWhatsApp: 9876543210\nGoal: Strength\nLevel: Beginner\nInjuries or health notes: None`}
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginTop: '14px' }}>
          <button
            type="button"
            className="btn btn-solid"
            disabled={pasteLoading || !pasteText.trim()}
            onClick={handleAddBatch}
          >
            {pasteLoading ? 'Adding...' : 'Add to records'}
          </button>
          {msg.text && (
            <span style={{ fontSize: '14px', color: msg.type === 'ok' ? 'var(--ok)' : 'var(--err)' }}>
              {msg.text}
            </span>
          )}
        </div>
      </section>

      {/* Member Table */}
      <section>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '16px'
        }}>
          <h2 style={{ fontSize: '26px', color: 'var(--fg)' }}>Member list</h2>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="search"
              placeholder="Search name, ID, phone or goal..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ maxWidth: '320px' }}
            />
            {members.length > 0 && (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={handleDownloadCsv}
              >
                <Download size={16} /> Download CSV
              </button>
            )}
          </div>
        </div>

        {filteredMembers.length > 0 ? (
          <div className="tablewrap">
            <table>
              <thead>
                <tr>
                  <th>Issued</th>
                  <th>Name</th>
                  <th>Member ID</th>
                  <th>WhatsApp</th>
                  <th>Runs Attended</th>
                  <th>Goal</th>
                  <th>Level</th>
                  <th>Health notes</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((m) => (
                  <tr key={m.id}>
                    <td style={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums', color: 'var(--muted)' }}>
                      {formatDate(m.issued_at || m.added_at)}
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--fg)', minWidth: '140px' }}>
                      {m.name || '—'}
                    </td>
                    <td style={{ font: '700 13px var(--mono)', color: 'var(--amber)', whiteSpace: 'nowrap' }}>
                      {m.id}
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {m.phone ? (
                        <a
                          href={`https://wa.me/${m.phone.length === 10 ? '91' : ''}${m.phone}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: 'var(--fg)', textDecoration: 'underline', textUnderlineOffset: '3px' }}
                        >
                          {m.phone}
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>
                      <span className="badge badge-amber" style={{ padding: '2px 8px' }}>
                        <Zap size={11} /> {m.runs_attended || 0} Runs
                      </span>
                    </td>
                    <td>{m.goal || '—'}</td>
                    <td>{m.level || '—'}</td>
                    <td style={{
                      minWidth: '180px',
                      maxWidth: '280px',
                      overflowWrap: 'anywhere',
                      color: hasHealth(m) ? 'var(--fg)' : 'var(--muted)'
                    }}>
                      {hasHealth(m) && (
                        <span style={{
                          display: 'inline-block',
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: 'var(--amber)',
                          marginRight: '8px'
                        }} />
                      )}
                      {m.health || 'None'}
                    </td>
                    <td style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
                      {pendingRemove === m.id ? (
                        <span>
                          Remove?{' '}
                          <button
                            type="button"
                            className="link danger"
                            onClick={() => handleRemove(m.id)}
                            style={{ color: 'var(--err)', marginRight: '6px' }}
                          >
                            Yes
                          </button>
                          <button
                            type="button"
                            className="link"
                            onClick={() => setPendingRemove(null)}
                          >
                            Cancel
                          </button>
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="link"
                          onClick={() => setPendingRemove(m.id)}
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{
            padding: '28px 22px',
            border: '1px dashed var(--line)',
            borderRadius: '14px',
            display: 'grid',
            gap: '14px'
          }}>
            <p style={{ margin: 0, color: 'var(--muted)', maxWidth: '60ch' }}>
              {members.length > 0
                ? 'No members match that search query.'
                : 'No members yet. When someone registers, they send you a WhatsApp message like the one below. Paste it above and they appear here.'}
            </p>
            <pre style={{
              margin: 0,
              padding: '14px 16px',
              overflowX: 'auto',
              background: 'var(--panel)',
              borderRadius: '10px',
              font: '500 13px/1.6 var(--mono)',
              color: 'var(--fg)'
            }}>
{`Hi Surge! I just registered.
Name: Rahul Sharma
Member ID: SRG-26-K7M4-Q2XH
WhatsApp: 9876543210
Goal: Strength
Level: Beginner
Issued: 15 NOV 2026
Injuries or health notes: None`}
            </pre>
          </div>
        )}
      </section>
    </div>
  );
}
