import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { bookingAPI, eventTypeAPI } from '../api/api';
import { Calendar, Clock, Users, TrendingUp, Video, MapPin, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

const StatusBadge = ({ status }) => {
    const map = { BOOKED: 'badge-success', CANCELLED: 'badge-danger', COMPLETED: 'badge-secondary' };
    return <span className={`badge ${map[status] || 'badge-secondary'}`}>{status}</span>;
};

export default function DashboardPage() {
    const { user } = useAuth();
    const [upcoming, setUpcoming] = useState([]);
    const [eventTypes, setEventTypes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([bookingAPI.getUpcoming(), eventTypeAPI.getAll()])
            .then(([bookingsRes, etRes]) => {
                setUpcoming(bookingsRes.data);
                setEventTypes(etRes.data);
            })
            .finally(() => setLoading(false));
    }, []);

    const bookingUrl = `${window.location.origin}/${user?.username}`;

    if (loading) return <div className="loading-screen"><div className="loading-spinner" style={{ width: 40, height: 40 }}></div></div>;

    return (
        <div>
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Good {getGreeting()}, {user?.name?.split(' ')[0]}! 👋</h1>
                    <p className="page-subtitle">Here's what's happening with your schedule</p>
                </div>
                <a href={bookingUrl} target="_blank" rel="noreferrer" className="btn btn-primary">
                    <ExternalLink size={16} />
                    View Public Page
                </a>
            </div>

            {/* Stats */}
            <div className="grid-4" style={{ marginBottom: 32 }}>
                <div className="stat-card">
                    <div style={{ color: 'var(--primary-light)' }}><Calendar size={24} /></div>
                    <div className="stat-value">{upcoming.length}</div>
                    <div className="stat-label">Upcoming Meetings</div>
                </div>
                <div className="stat-card">
                    <div style={{ color: 'var(--success)' }}><Clock size={24} /></div>
                    <div className="stat-value">{eventTypes.filter(e => e.active).length}</div>
                    <div className="stat-label">Active Event Types</div>
                </div>
                <div className="stat-card">
                    <div style={{ color: 'var(--secondary)' }}><Users size={24} /></div>
                    <div className="stat-value">{eventTypes.length}</div>
                    <div className="stat-label">Total Event Types</div>
                </div>
                <div className="stat-card">
                    <div style={{ color: 'var(--accent)' }}><TrendingUp size={24} /></div>
                    <div className="stat-value">FREE</div>
                    <div className="stat-label">Current Plan</div>
                </div>
            </div>

            <div className="grid-2">
                {/* Upcoming Meetings */}
                <div className="card">
                    <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Upcoming Meetings</h2>
                    {upcoming.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">📅</div>
                            <h3>No upcoming meetings</h3>
                            <p>Share your booking link to get started</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {upcoming.slice(0, 5).map(booking => (
                                <div key={booking.id} style={{
                                    padding: 16, background: 'var(--bg-input)', borderRadius: 12,
                                    border: '1px solid var(--border)', display: 'flex', gap: 12, alignItems: 'flex-start',
                                }}>
                                    <div style={{
                                        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 16, fontWeight: 700, color: 'white',
                                    }}>
                                        {booking.guestName?.charAt(0)?.toUpperCase()}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontWeight: 600, fontSize: 14 }}>{booking.guestName}</p>
                                        <p style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{booking.eventTypeName}</p>
                                        <p style={{ color: 'var(--primary-light)', fontSize: 12, marginTop: 4 }}>
                                            {format(new Date(booking.startTime), 'MMM d, yyyy • h:mm a')}
                                        </p>
                                    </div>
                                    <StatusBadge status={booking.status} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Event Types */}
                <div className="card">
                    <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Your Event Types</h2>
                    {eventTypes.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">⚡</div>
                            <h3>No event types yet</h3>
                            <p>Create your first event type to start booking</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {eventTypes.slice(0, 5).map(et => (
                                <div key={et.id} style={{
                                    padding: 16, background: 'var(--bg-input)', borderRadius: 12,
                                    border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12,
                                }}>
                                    <div style={{ width: 4, height: 40, borderRadius: 2, background: et.color || 'var(--primary)', flexShrink: 0 }} />
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontWeight: 600, fontSize: 14 }}>{et.name}</p>
                                        <p style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{et.durationMinutes} min • {et.locationType}</p>
                                    </div>
                                    <span className={`badge ${et.active ? 'badge-success' : 'badge-secondary'}`}>
                                        {et.active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'morning';
    if (h < 17) return 'afternoon';
    return 'evening';
}
