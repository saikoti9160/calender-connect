import React, { useState, useEffect } from 'react';
import { availabilityAPI } from '../api/api';
import toast from 'react-hot-toast';
import { Save } from 'lucide-react';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const DEFAULT_AVAILABILITY = DAYS.map(day => ({
    dayOfWeek: day,
    startTime: '09:00',
    endTime: '17:00',
    isAvailable: !['SATURDAY', 'SUNDAY'].includes(day),
}));

export default function AvailabilityPage() {
    const [availability, setAvailability] = useState(DEFAULT_AVAILABILITY);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        availabilityAPI.getMyAvailability().then(res => {
            if (res.data.length > 0) {
                // Merge with defaults
                const merged = DEFAULT_AVAILABILITY.map(def => {
                    const existing = res.data.find(r => r.dayOfWeek === def.dayOfWeek);
                    return existing ? {
                        dayOfWeek: existing.dayOfWeek,
                        startTime: existing.startTime,
                        endTime: existing.endTime,
                        isAvailable: existing.isAvailable,
                    } : def;
                });
                setAvailability(merged);
            }
        }).finally(() => setLoading(false));
    }, []);

    const updateDay = (day, field, value) => {
        setAvailability(prev => prev.map(a => a.dayOfWeek === day ? { ...a, [field]: value } : a));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await availabilityAPI.saveAvailability(availability);
            toast.success('Availability saved!');
        } catch (err) {
            toast.error('Failed to save availability');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="loading-screen"><div className="loading-spinner" style={{ width: 40, height: 40 }}></div></div>;

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Availability</h1>
                    <p className="page-subtitle">Set your weekly working hours</p>
                </div>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                    {saving ? <span className="loading-spinner"></span> : <Save size={16} />}
                    Save Changes
                </button>
            </div>

            <div className="card">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {availability.map((avail, idx) => (
                        <div key={avail.dayOfWeek} style={{
                            display: 'flex', alignItems: 'center', gap: 20, padding: '20px 0',
                            borderBottom: idx < availability.length - 1 ? '1px solid var(--border)' : 'none',
                        }}>
                            {/* Toggle */}
                            <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', minWidth: 160 }}>
                                <div style={{ position: 'relative' }}>
                                    <input type="checkbox" checked={avail.isAvailable}
                                        onChange={e => updateDay(avail.dayOfWeek, 'isAvailable', e.target.checked)}
                                        style={{ display: 'none' }} />
                                    <div onClick={() => updateDay(avail.dayOfWeek, 'isAvailable', !avail.isAvailable)} style={{
                                        width: 44, height: 24, borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s',
                                        background: avail.isAvailable ? 'var(--primary)' : 'var(--bg-input)',
                                        border: '1px solid var(--border)', position: 'relative',
                                    }}>
                                        <div style={{
                                            position: 'absolute', top: 2, left: avail.isAvailable ? 22 : 2,
                                            width: 18, height: 18, borderRadius: '50%', background: 'white',
                                            transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                                        }} />
                                    </div>
                                </div>
                                <span style={{ fontWeight: 600, fontSize: 14, color: avail.isAvailable ? 'var(--text-primary)' : 'var(--text-muted)', minWidth: 100 }}>
                                    {avail.dayOfWeek.charAt(0) + avail.dayOfWeek.slice(1).toLowerCase()}
                                </span>
                            </label>

                            {/* Time Range */}
                            {avail.isAvailable ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <input type="time" className="form-input" style={{ width: 130 }}
                                        value={avail.startTime}
                                        onChange={e => updateDay(avail.dayOfWeek, 'startTime', e.target.value)} />
                                    <span style={{ color: 'var(--text-muted)' }}>to</span>
                                    <input type="time" className="form-input" style={{ width: 130 }}
                                        value={avail.endTime}
                                        onChange={e => updateDay(avail.dayOfWeek, 'endTime', e.target.value)} />
                                </div>
                            ) : (
                                <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>Unavailable</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
