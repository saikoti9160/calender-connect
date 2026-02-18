import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../api/api';
import toast from 'react-hot-toast';
import { User, Mail, AtSign, Globe, Save, Copy, Check, ExternalLink } from 'lucide-react';

export default function ProfilePage() {
    const { user, updateUser } = useAuth();
    const [form, setForm] = useState({ name: user?.name || '', username: user?.username || '', timezone: user?.timezone || 'UTC' });
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const timezones = Intl.supportedValuesOf('timeZone');
    const bookingUrl = `${window.location.origin}/${user?.username}`;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await userAPI.updateProfile(form);
            updateUser({ ...user, ...res.data });
            toast.success('Profile updated!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const copyLink = () => {
        navigator.clipboard.writeText(bookingUrl);
        setCopied(true);
        toast.success('Link copied!');
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Profile</h1>
                    <p className="page-subtitle">Manage your account settings</p>
                </div>
            </div>

            <div className="grid-2" style={{ alignItems: 'start' }}>
                {/* Profile Form */}
                <div className="card">
                    <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>Account Information</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <div style={{ position: 'relative' }}>
                                <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input className="form-input" style={{ paddingLeft: 40 }} value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })} required />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input className="form-input" style={{ paddingLeft: 40 }} value={user?.email} disabled />
                            </div>
                            <p className="form-error" style={{ color: 'var(--text-muted)' }}>Email cannot be changed</p>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Username</label>
                            <div style={{ position: 'relative' }}>
                                <AtSign size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input className="form-input" style={{ paddingLeft: 40 }} value={form.username}
                                    onChange={e => setForm({ ...form, username: e.target.value.toLowerCase().replace(/\s/g, '') })} required />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Timezone</label>
                            <div style={{ position: 'relative' }}>
                                <Globe size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }} />
                                <select className="form-input" style={{ paddingLeft: 40 }} value={form.timezone}
                                    onChange={e => setForm({ ...form, timezone: e.target.value })}>
                                    {timezones.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                                </select>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? <span className="loading-spinner"></span> : <Save size={16} />}
                            Save Changes
                        </button>
                    </form>
                </div>

                {/* Booking Link & Plan */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div className="card">
                        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Your Booking Link</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 16 }}>
                            Share this link with anyone to let them book time with you.
                        </p>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            background: 'var(--bg-input)', borderRadius: 10, padding: '12px 16px',
                            border: '1px solid var(--border)',
                        }}>
                            <span style={{ flex: 1, fontSize: 13, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {bookingUrl}
                            </span>
                            <button onClick={copyLink} className="btn btn-secondary btn-sm">
                                {copied ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
                            </button>
                        </div>
                        <a href={bookingUrl} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{ marginTop: 12 }}>
                            <ExternalLink size={14} /> Preview Page
                        </a>
                    </div>

                    <div className="card" style={{ borderTop: '3px solid var(--primary)' }}>
                        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Current Plan</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                            <span style={{ fontSize: 32, fontWeight: 800 }}>FREE</span>
                            <span className="badge badge-success">Active</span>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 16 }}>
                            Upgrade to PRO for unlimited event types, team features, and priority support.
                        </p>
                        <button className="btn btn-primary btn-full">
                            Upgrade to PRO — $12/mo
                        </button>
                    </div>

                    <div className="card">
                        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Account Role</h2>
                        <span className={`badge ${user?.role === 'ADMIN' ? 'badge-warning' : 'badge-primary'}`}>
                            {user?.role}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
