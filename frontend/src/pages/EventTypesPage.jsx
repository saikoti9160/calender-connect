import React, { useState, useEffect } from 'react';
import { eventTypeAPI } from '../api/api';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Clock, MapPin, X } from 'lucide-react';

const LOCATION_TYPES = ['CUSTOM', 'GOOGLE_MEET', 'ZOOM'];
const COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

function EventTypeModal({ eventType, onClose, onSave }) {
    const [form, setForm] = useState(eventType || {
        name: '', description: '', durationMinutes: 30,
        locationType: 'CUSTOM', locationDetails: '', bufferBefore: 0, bufferAfter: 0, color: '#6366f1',
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (eventType?.id) {
                const res = await eventTypeAPI.update(eventType.id, form);
                onSave(res.data, 'update');
            } else {
                const res = await eventTypeAPI.create(form);
                onSave(res.data, 'create');
            }
            toast.success(eventType?.id ? 'Event type updated!' : 'Event type created!');
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }} onClick={onClose}>
            <div className="card" style={{ width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 700 }}>{eventType?.id ? 'Edit' : 'New'} Event Type</h2>
                    <button onClick={onClose} className="btn btn-ghost btn-sm"><X size={18} /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Name *</label>
                        <input className="form-input" placeholder="e.g. 30 Minute Meeting" value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea className="form-input" placeholder="Brief description..." value={form.description || ''}
                            onChange={e => setForm({ ...form, description: e.target.value })} rows={3} />
                    </div>
                    <div className="grid-2">
                        <div className="form-group">
                            <label className="form-label">Duration (minutes) *</label>
                            <select className="form-input" value={form.durationMinutes}
                                onChange={e => setForm({ ...form, durationMinutes: parseInt(e.target.value) })}>
                                {[15, 20, 30, 45, 60, 90, 120].map(d => <option key={d} value={d}>{d} min</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Location Type</label>
                            <select className="form-input" value={form.locationType}
                                onChange={e => setForm({ ...form, locationType: e.target.value })}>
                                {LOCATION_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                            </select>
                        </div>
                    </div>
                    {form.locationType === 'CUSTOM' && (
                        <div className="form-group">
                            <label className="form-label">Location Details</label>
                            <input className="form-input" placeholder="e.g. Office, Phone number, address..." value={form.locationDetails || ''}
                                onChange={e => setForm({ ...form, locationDetails: e.target.value })} />
                        </div>
                    )}
                    <div className="grid-2">
                        <div className="form-group">
                            <label className="form-label">Buffer Before (min)</label>
                            <input type="number" className="form-input" min={0} max={60} value={form.bufferBefore}
                                onChange={e => setForm({ ...form, bufferBefore: parseInt(e.target.value) || 0 })} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Buffer After (min)</label>
                            <input type="number" className="form-input" min={0} max={60} value={form.bufferAfter}
                                onChange={e => setForm({ ...form, bufferAfter: parseInt(e.target.value) || 0 })} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Color</label>
                        <div style={{ display: 'flex', gap: 8 }}>
                            {COLORS.map(c => (
                                <button key={c} type="button" onClick={() => setForm({ ...form, color: c })}
                                    style={{
                                        width: 32, height: 32, borderRadius: '50%', background: c, border: 'none', cursor: 'pointer',
                                        outline: form.color === c ? `3px solid white` : 'none',
                                        outlineOffset: 2, transform: form.color === c ? 'scale(1.2)' : 'scale(1)',
                                        transition: 'all 0.2s',
                                    }} />
                            ))}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? <span className="loading-spinner"></span> : (eventType?.id ? 'Update' : 'Create')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function EventTypesPage() {
    const [eventTypes, setEventTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);

    useEffect(() => {
        eventTypeAPI.getAll().then(res => setEventTypes(res.data)).finally(() => setLoading(false));
    }, []);

    const handleSave = (saved, action) => {
        if (action === 'create') setEventTypes(prev => [saved, ...prev]);
        else setEventTypes(prev => prev.map(e => e.id === saved.id ? saved : e));
    };

    const handleToggle = async (id) => {
        try {
            const res = await eventTypeAPI.toggle(id);
            setEventTypes(prev => prev.map(e => e.id === id ? res.data : e));
            toast.success('Updated!');
        } catch { toast.error('Failed to update'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this event type?')) return;
        try {
            await eventTypeAPI.delete(id);
            setEventTypes(prev => prev.filter(e => e.id !== id));
            toast.success('Deleted!');
        } catch { toast.error('Failed to delete'); }
    };

    if (loading) return <div className="loading-screen"><div className="loading-spinner" style={{ width: 40, height: 40 }}></div></div>;

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Event Types</h1>
                    <p className="page-subtitle">Create and manage your meeting types</p>
                </div>
                <button className="btn btn-primary" onClick={() => { setEditing(null); setModalOpen(true); }}>
                    <Plus size={18} /> New Event Type
                </button>
            </div>

            {eventTypes.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon">⚡</div>
                        <h3>No event types yet</h3>
                        <p>Create your first event type to start accepting bookings</p>
                        <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => setModalOpen(true)}>
                            <Plus size={16} /> Create Event Type
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid-3">
                    {eventTypes.map(et => (
                        <div key={et.id} className="card card-hover" style={{ borderLeft: `4px solid ${et.color || 'var(--primary)'}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                <span className={`badge ${et.active ? 'badge-success' : 'badge-secondary'}`}>
                                    {et.active ? 'Active' : 'Inactive'}
                                </span>
                                <div style={{ display: 'flex', gap: 4 }}>
                                    <button className="btn btn-ghost btn-sm" onClick={() => { setEditing(et); setModalOpen(true); }}><Edit2 size={14} /></button>
                                    <button className="btn btn-ghost btn-sm" onClick={() => handleToggle(et.id)}>
                                        {et.active ? <ToggleRight size={16} color="var(--success)" /> : <ToggleLeft size={16} />}
                                    </button>
                                    <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(et.id)}><Trash2 size={14} color="var(--danger)" /></button>
                                </div>
                            </div>
                            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{et.name}</h3>
                            {et.description && <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 12 }}>{et.description}</p>}
                            <div style={{ display: 'flex', gap: 16, color: 'var(--text-secondary)', fontSize: 13 }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={14} />{et.durationMinutes} min</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={14} />{et.locationType}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {modalOpen && (
                <EventTypeModal
                    eventType={editing}
                    onClose={() => { setModalOpen(false); setEditing(null); }}
                    onSave={handleSave}
                />
            )}
        </div>
    );
}
