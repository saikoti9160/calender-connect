import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { publicAPI } from '../api/api';
import toast from 'react-hot-toast';
import { format, addDays, startOfDay } from 'date-fns';
import { Clock, MapPin, ChevronLeft, ChevronRight, Zap, CheckCircle, Video, User, Mail, FileText } from 'lucide-react';

export default function PublicBookingPage() {
    const { username, eventTypeId } = useParams();
    const [profile, setProfile] = useState(null);
    const [eventTypes, setEventTypes] = useState([]);
    const [selectedET, setSelectedET] = useState(null);
    const [slots, setSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [currentDate, setCurrentDate] = useState(startOfDay(new Date()));
    const [step, setStep] = useState('select-event'); // select-event | select-slot | book-form | success
    const [form, setForm] = useState({ guestName: '', guestEmail: '', notes: '' });
    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState(null);
    const [slotsLoading, setSlotsLoading] = useState(false);

    useEffect(() => {
        Promise.all([publicAPI.getProfile(username), publicAPI.getEventTypes(username)])
            .then(([profileRes, etRes]) => {
                setProfile(profileRes.data);
                setEventTypes(etRes.data);
                if (eventTypeId) {
                    const et = etRes.data.find(e => e.id === parseInt(eventTypeId));
                    if (et) { setSelectedET(et); setStep('select-slot'); }
                }
            })
            .catch(() => toast.error('User not found'))
            .finally(() => setLoading(false));
    }, [username, eventTypeId]);

    useEffect(() => {
        if (selectedET && step === 'select-slot') {
            setSlotsLoading(true);
            publicAPI.getSlots(username, selectedET.id, format(currentDate, 'yyyy-MM-dd'))
                .then(res => setSlots(res.data))
                .finally(() => setSlotsLoading(false));
        }
    }, [selectedET, currentDate, step]);

    const handleBook = async (e) => {
        e.preventDefault();
        try {
            const res = await publicAPI.book(username, {
                eventTypeId: selectedET.id,
                guestName: form.guestName,
                guestEmail: form.guestEmail,
                startTime: selectedSlot.startTime,
                notes: form.notes,
            });
            setBooking(res.data);
            setStep('success');
            toast.success('Meeting booked! 🎉');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to book. Please try again.');
        }
    };

    if (loading) return (
        <div className="loading-screen" style={{ background: 'var(--bg-primary)' }}>
            <div style={{ width: 56, height: 56, background: 'linear-gradient(135deg, var(--primary), var(--secondary))', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Zap size={28} color="white" />
            </div>
            <div className="loading-spinner" style={{ width: 32, height: 32 }}></div>
        </div>
    );

    return (
        <div style={{
            minHeight: '100vh', background: 'radial-gradient(ellipse at top, rgba(99,102,241,0.1) 0%, var(--bg-primary) 60%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px',
        }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
                <div style={{
                    width: 72, height: 72, borderRadius: '50%', margin: '0 auto 16px',
                    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 28, fontWeight: 800, color: 'white', boxShadow: 'var(--shadow-glow)',
                }}>
                    {profile?.name?.charAt(0)?.toUpperCase()}
                </div>
                <h1 style={{ fontSize: 24, fontWeight: 800 }}>{profile?.name}</h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>Schedule a meeting</p>
            </div>

            <div style={{ width: '100%', maxWidth: 700 }}>
                {/* Step: Select Event Type */}
                {step === 'select-event' && (
                    <div>
                        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, textAlign: 'center' }}>Choose a meeting type</h2>
                        {eventTypes.length === 0 ? (
                            <div className="card"><div className="empty-state"><h3>No event types available</h3></div></div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {eventTypes.map(et => (
                                    <div key={et.id} className="card card-hover" style={{ cursor: 'pointer', borderLeft: `4px solid ${et.color}` }}
                                        onClick={() => { setSelectedET(et); setStep('select-slot'); }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <h3 style={{ fontSize: 18, fontWeight: 700 }}>{et.name}</h3>
                                                {et.description && <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>{et.description}</p>}
                                                <div style={{ display: 'flex', gap: 16, marginTop: 8, color: 'var(--text-secondary)', fontSize: 13 }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={13} />{et.durationMinutes} min</span>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={13} />{et.locationType.replace('_', ' ')}</span>
                                                </div>
                                            </div>
                                            <ChevronRight size={20} color="var(--text-muted)" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Step: Select Slot */}
                {step === 'select-slot' && selectedET && (
                    <div className="card">
                        <button className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }} onClick={() => setStep('select-event')}>
                            <ChevronLeft size={16} /> Back
                        </button>
                        <div style={{ marginBottom: 24 }}>
                            <h2 style={{ fontSize: 20, fontWeight: 700 }}>{selectedET.name}</h2>
                            <div style={{ display: 'flex', gap: 16, marginTop: 8, color: 'var(--text-secondary)', fontSize: 13 }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={13} />{selectedET.durationMinutes} min</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={13} />{selectedET.locationType.replace('_', ' ')}</span>
                            </div>
                        </div>

                        {/* Date Navigation */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => setCurrentDate(d => addDays(d, -7))}
                                disabled={currentDate <= startOfDay(new Date())}>
                                <ChevronLeft size={16} />
                            </button>
                            <span style={{ fontWeight: 600 }}>
                                {format(currentDate, 'MMM d')} – {format(addDays(currentDate, 6), 'MMM d, yyyy')}
                            </span>
                            <button className="btn btn-secondary btn-sm" onClick={() => setCurrentDate(d => addDays(d, 7))}>
                                <ChevronRight size={16} />
                            </button>
                        </div>

                        {slotsLoading ? (
                            <div style={{ textAlign: 'center', padding: 40 }}><div className="loading-spinner" style={{ width: 32, height: 32, margin: '0 auto' }}></div></div>
                        ) : slots.length === 0 ? (
                            <div className="empty-state"><h3>No available slots</h3><p>Try a different week</p></div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 8 }}>
                                {slots.map((slot, i) => (
                                    <button key={i} onClick={() => { setSelectedSlot(slot); setStep('book-form'); }}
                                        style={{
                                            padding: '10px 8px', borderRadius: 10, border: '1px solid var(--border)',
                                            background: 'var(--bg-input)', color: 'var(--text-primary)',
                                            cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', fontWeight: 500,
                                            transition: 'all 0.2s', textAlign: 'center',
                                        }}
                                        onMouseEnter={e => { e.target.style.background = 'var(--primary)'; e.target.style.borderColor = 'var(--primary)'; }}
                                        onMouseLeave={e => { e.target.style.background = 'var(--bg-input)'; e.target.style.borderColor = 'var(--border)'; }}>
                                        <div style={{ fontWeight: 600 }}>{format(new Date(slot.startTime), 'EEE, MMM d')}</div>
                                        <div>{format(new Date(slot.startTime), 'h:mm a')}</div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Step: Booking Form */}
                {step === 'book-form' && selectedSlot && (
                    <div className="card">
                        <button className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }} onClick={() => setStep('select-slot')}>
                            <ChevronLeft size={16} /> Back
                        </button>
                        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Confirm your booking</h2>
                        <div style={{ padding: 16, background: 'var(--bg-input)', borderRadius: 12, marginBottom: 24, border: '1px solid var(--border)' }}>
                            <p style={{ fontWeight: 600 }}>{selectedET.name}</p>
                            <p style={{ color: 'var(--primary-light)', marginTop: 4 }}>
                                {format(new Date(selectedSlot.startTime), 'EEEE, MMMM d, yyyy • h:mm a')} – {format(new Date(selectedSlot.endTime), 'h:mm a')}
                            </p>
                        </div>
                        <form onSubmit={handleBook}>
                            <div className="form-group">
                                <label className="form-label">Your Name *</label>
                                <div style={{ position: 'relative' }}>
                                    <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input className="form-input" style={{ paddingLeft: 40 }} placeholder="John Doe"
                                        value={form.guestName} onChange={e => setForm({ ...form, guestName: e.target.value })} required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email Address *</label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input type="email" className="form-input" style={{ paddingLeft: 40 }} placeholder="you@example.com"
                                        value={form.guestEmail} onChange={e => setForm({ ...form, guestEmail: e.target.value })} required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Additional Notes</label>
                                <div style={{ position: 'relative' }}>
                                    <FileText size={16} style={{ position: 'absolute', left: 14, top: 14, color: 'var(--text-muted)' }} />
                                    <textarea className="form-input" style={{ paddingLeft: 40 }} placeholder="Anything you'd like to share..."
                                        value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} />
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary btn-full btn-lg">
                                Confirm Booking
                            </button>
                        </form>
                    </div>
                )}

                {/* Step: Success */}
                {step === 'success' && booking && (
                    <div className="card" style={{ textAlign: 'center', padding: 48 }}>
                        <div style={{ color: 'var(--success)', marginBottom: 20 }}><CheckCircle size={64} /></div>
                        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>You're booked! 🎉</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>A confirmation has been sent to {booking.guestEmail}</p>
                        <div style={{ padding: 20, background: 'var(--bg-input)', borderRadius: 12, border: '1px solid var(--border)', textAlign: 'left', marginBottom: 24 }}>
                            <p style={{ fontWeight: 700, marginBottom: 8 }}>{booking.eventTypeName}</p>
                            <p style={{ color: 'var(--primary-light)' }}>
                                {format(new Date(booking.startTime), 'EEEE, MMMM d, yyyy')}
                            </p>
                            <p style={{ color: 'var(--primary-light)' }}>
                                {format(new Date(booking.startTime), 'h:mm a')} – {format(new Date(booking.endTime), 'h:mm a')}
                            </p>
                            {booking.meetingLink && (
                                <a href={booking.meetingLink} target="_blank" rel="noreferrer"
                                    className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>
                                    <Video size={14} /> Join Meeting
                                </a>
                            )}
                        </div>
                        <button className="btn btn-secondary" onClick={() => { setStep('select-event'); setSelectedSlot(null); setForm({ guestName: '', guestEmail: '', notes: '' }); }}>
                            Book Another Meeting
                        </button>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div style={{ marginTop: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                    Powered by <Zap size={14} color="var(--primary)" /> <strong style={{ color: 'var(--primary-light)' }}>Schedulr</strong>
                </span>
            </div>
        </div>
    );
}
