import React, { useState, useEffect } from 'react';
import { bookingAPI } from '../api/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { Video, MapPin, X, Clock, User } from 'lucide-react';

const StatusBadge = ({ status }) => {
    const map = { BOOKED: 'badge-success', CANCELLED: 'badge-danger', COMPLETED: 'badge-secondary' };
    return <span className={`badge ${map[status] || 'badge-secondary'}`}>{status}</span>;
};

function BookingCard({ booking, onCancel }) {
    return (
        <div className="card card-hover" style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: 16, flex: 1 }}>
                    <div style={{
                        width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 20, fontWeight: 700, color: 'white',
                    }}>
                        {booking.guestName?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                            <h3 style={{ fontSize: 16, fontWeight: 700 }}>{booking.guestName}</h3>
                            <StatusBadge status={booking.status} />
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{booking.guestEmail}</p>
                        <p style={{ color: 'var(--primary-light)', fontSize: 13, fontWeight: 600, marginTop: 4 }}>
                            {booking.eventTypeName} • {booking.durationMinutes} min
                        </p>
                        <div style={{ display: 'flex', gap: 16, marginTop: 8, color: 'var(--text-secondary)', fontSize: 13 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Clock size={13} />
                                {format(new Date(booking.startTime), 'MMM d, yyyy • h:mm a')}
                            </span>
                            {booking.meetingLink && (
                                <a href={booking.meetingLink} target="_blank" rel="noreferrer"
                                    style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--secondary)' }}>
                                    <Video size={13} /> Join Meeting
                                </a>
                            )}
                        </div>
                        {booking.notes && (
                            <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 8, fontStyle: 'italic' }}>
                                Notes: {booking.notes}
                            </p>
                        )}
                    </div>
                </div>
                {booking.status === 'BOOKED' && (
                    <button className="btn btn-danger btn-sm" onClick={() => onCancel(booking.id)}>
                        <X size={14} /> Cancel
                    </button>
                )}
            </div>
        </div>
    );
}

export default function BookingsPage() {
    const [tab, setTab] = useState('upcoming');
    const [upcoming, setUpcoming] = useState([]);
    const [past, setPast] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([bookingAPI.getUpcoming(), bookingAPI.getPast()])
            .then(([u, p]) => { setUpcoming(u.data); setPast(p.data); })
            .finally(() => setLoading(false));
    }, []);

    const handleCancel = async (id) => {
        if (!confirm('Cancel this meeting?')) return;
        try {
            const res = await bookingAPI.cancel(id, 'Cancelled by host');
            setUpcoming(prev => prev.map(b => b.id === id ? res.data : b));
            toast.success('Meeting cancelled');
        } catch { toast.error('Failed to cancel'); }
    };

    const tabs = [
        { key: 'upcoming', label: 'Upcoming', count: upcoming.length },
        { key: 'past', label: 'Past', count: past.length },
    ];

    if (loading) return <div className="loading-screen"><div className="loading-spinner" style={{ width: 40, height: 40 }}></div></div>;

    const current = tab === 'upcoming' ? upcoming : past;

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Meetings</h1>
                    <p className="page-subtitle">Manage your scheduled meetings</p>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--bg-card)', borderRadius: 12, padding: 4, width: 'fit-content' }}>
                {tabs.map(t => (
                    <button key={t.key} onClick={() => setTab(t.key)} style={{
                        padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
                        background: tab === t.key ? 'var(--primary)' : 'transparent',
                        color: tab === t.key ? 'white' : 'var(--text-secondary)',
                        fontWeight: 600, fontSize: 14, transition: 'all 0.2s', fontFamily: 'inherit',
                    }}>
                        {t.label} <span style={{ opacity: 0.7 }}>({t.count})</span>
                    </button>
                ))}
            </div>

            {current.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon">📅</div>
                        <h3>No {tab} meetings</h3>
                        <p>{tab === 'upcoming' ? 'Share your booking link to get meetings scheduled' : 'Your past meetings will appear here'}</p>
                    </div>
                </div>
            ) : (
                current.map(b => <BookingCard key={b.id} booking={b} onCancel={handleCancel} />)
            )}
        </div>
    );
}
