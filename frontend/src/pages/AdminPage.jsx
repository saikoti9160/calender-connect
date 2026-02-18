import React, { useState, useEffect } from 'react';
import { adminAPI } from '../api/api';
import toast from 'react-hot-toast';
import { Users, CreditCard, TrendingUp, Shield, ToggleLeft, ToggleRight } from 'lucide-react';

export default function AdminPage() {
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('users');

    useEffect(() => {
        Promise.all([adminAPI.getUsers(), adminAPI.getStats()])
            .then(([usersRes, statsRes]) => { setUsers(usersRes.data); setStats(statsRes.data); })
            .finally(() => setLoading(false));
    }, []);

    const handleToggleUser = async (userId) => {
        try {
            const res = await adminAPI.toggleUser(userId);
            setUsers(prev => prev.map(u => u.id === userId ? res.data : u));
            toast.success('User status updated');
        } catch { toast.error('Failed to update user'); }
    };

    if (loading) return <div className="loading-screen"><div className="loading-spinner" style={{ width: 40, height: 40 }}></div></div>;

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Shield size={28} color="var(--warning)" /> Admin Panel
                    </h1>
                    <p className="page-subtitle">Platform administration and oversight</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid-3" style={{ marginBottom: 32 }}>
                <div className="stat-card">
                    <div style={{ color: 'var(--primary-light)' }}><Users size={24} /></div>
                    <div className="stat-value">{stats.totalUsers || 0}</div>
                    <div className="stat-label">Total Users</div>
                </div>
                <div className="stat-card">
                    <div style={{ color: 'var(--success)' }}><CreditCard size={24} /></div>
                    <div className="stat-value">{stats.totalSubscriptions || 0}</div>
                    <div className="stat-label">Subscriptions</div>
                </div>
                <div className="stat-card">
                    <div style={{ color: 'var(--accent)' }}><TrendingUp size={24} /></div>
                    <div className="stat-value">{stats.totalPayments || 0}</div>
                    <div className="stat-label">Payments</div>
                </div>
            </div>

            {/* Users Table */}
            <div className="card">
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>All Users</h2>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                {['User', 'Email', 'Username', 'Role', 'Status', 'Actions'].map(h => (
                                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{
                                                width: 36, height: 36, borderRadius: '50%',
                                                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: 14, fontWeight: 700, color: 'white', flexShrink: 0,
                                            }}>
                                                {user.name?.charAt(0)?.toUpperCase()}
                                            </div>
                                            <span style={{ fontWeight: 600, fontSize: 14 }}>{user.name}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: 13 }}>{user.email}</td>
                                    <td style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: 13 }}>@{user.username}</td>
                                    <td style={{ padding: '16px' }}>
                                        <span className={`badge ${user.role === 'ADMIN' ? 'badge-warning' : 'badge-primary'}`}>{user.role}</span>
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <span className={`badge ${user.active ? 'badge-success' : 'badge-danger'}`}>
                                            {user.active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <button className="btn btn-ghost btn-sm" onClick={() => handleToggleUser(user.id)}>
                                            {user.active ? <ToggleRight size={18} color="var(--success)" /> : <ToggleLeft size={18} color="var(--text-muted)" />}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
