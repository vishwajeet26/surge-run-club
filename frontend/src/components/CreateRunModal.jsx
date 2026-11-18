import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Calendar, Plus } from 'lucide-react';

export default function CreateRunModal({ isOpen, onClose, onCreated }) {
  const { apiFetch } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().slice(0, 10),
    time: '06:15 AM',
    location: '',
    distance_km: 5.0,
    pace_groups: '5:30/km, 6:30/km, 7:30/km, Walk-Run',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await apiFetch('/api/runs', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          distance_km: parseFloat(formData.distance_km) || 5.0,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to create run');
      }
      onCreated();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <span className="badge badge-amber" style={{ marginBottom: '4px' }}>ORGANIZER DESK</span>
            <h2 style={{ fontSize: '26px', color: 'var(--fg)' }}>Schedule New Group Run</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}
          >
            <X size={22} />
          </button>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', background: 'rgba(255, 154, 154, 0.1)', border: '1px solid var(--err)', borderRadius: '8px', color: 'var(--err)', marginBottom: '16px', fontSize: '13px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '14px' }}>
          <div>
            <label>Run Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Saturday Sunrise 5K & Coffee"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label>Date *</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div>
              <label>Start Time *</label>
              <input
                type="text"
                required
                placeholder="e.g. 06:15 AM"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
            <div>
              <label>Meeting Location *</label>
              <input
                type="text"
                required
                placeholder="e.g. Cubbon Park Gate 2, Bengaluru"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div>
              <label>Distance (KM) *</label>
              <input
                type="number"
                step="0.5"
                min="1"
                required
                value={formData.distance_km}
                onChange={(e) => setFormData({ ...formData, distance_km: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label>Pace Groups</label>
            <input
              type="text"
              placeholder="e.g. 5:15/km, 6:00/km, 7:00/km, Walk-Run"
              value={formData.pace_groups}
              onChange={(e) => setFormData({ ...formData, pace_groups: e.target.value })}
            />
          </div>

          <div>
            <label>Route & Post-Run Info</label>
            <textarea
              rows="3"
              placeholder="e.g. Easy shaded loop followed by filter coffee at Airlines Hotel. All paces welcome!"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-solid" disabled={loading}>
              <Plus size={16} /> {loading ? 'Scheduling...' : 'Publish Run (Free RSVP)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
