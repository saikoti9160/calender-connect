import React, { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard, Calendar, Clock, BookOpen, User, Settings,
    LogOut, ChevronRight, Shield, Menu, X, Zap, Copy, Check
} from 'lucide-react';
import toast from 'react-hot-toast';

const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/event-types', icon: Calendar, label: 'Event Types' },
    { to: '/availability', icon: Clock, label: 'Availability' },
    { to: '/bookings', icon: BookOpen, label: 'Meetings' },
    { to: '/profile', icon: User, label: 'Profile' },
];

export default function DashboardLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [copied, setCopied] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
        toast.success('Logged out successfully');
    };

    const bookingUrl = `${window.location.origin}/${user?.username}`;
    const copyLink = () => {
        navigator.clipboard.writeText(bookingUrl);
        setCopied(true);
        toast.success('Booking link copied!');
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="dashboard-layout">
            {/* Sidebar */}
            <aside style={{
                width: 'var(--sidebar-width)',
                background: 'var(--bg-secondary)',
                borderRight: '1px solid var(--border)',
                position: 'fixed',
                top: 0, left: 0, bottom: 0,
                display: 'flex',
                flexDirection: 'column',
                zIndex: 100,
                transition: 'transform 0.3s ease',
            }}>
                {/* Logo */}
                <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 36, height: 36,
                            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                            borderRadius: 10,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Zap size={20} color="white" />
                        </div>
                        <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.5px' }}>Schedulr</span>
                    </div>
                </div>

                {/* Booking Link */}
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Your Booking Link</p>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        background: 'var(--bg-input)', borderRadius: 8, padding: '8px 12px',
                        border: '1px solid var(--border)',
                    }}>
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            /{user?.username}
                        </span>
                        <button onClick={copyLink} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied ? 'var(--success)' : 'var(--text-muted)', padding: 0 }}>
                            {copied ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                    </div>
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, padding: '12px 12px', overflowY: 'auto' }}>
                    {navItems.map(({ to, icon: Icon, label }) => (
                        <NavLink key={to} to={to} style={({ isActive }) => ({
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: '10px 12px', borderRadius: 10, marginBottom: 4,
                            fontSize: 14, fontWeight: 500,
                            color: isActive ? 'white' : 'var(--text-secondary)',
                            background: isActive ? 'linear-gradient(135deg, var(--primary), var(--primary-dark))' : 'transparent',
                            boxShadow: isActive ? '0 4px 12px rgba(99,102,241,0.4)' : 'none',
                            transition: 'all 0.2s',
                            textDecoration: 'none',
                        })}>
                            <Icon size={18} />
                            {label}
                        </NavLink>
                    ))}
                    {user?.role === 'ADMIN' && (
                        <NavLink to="/admin" style={({ isActive }) => ({
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: '10px 12px', borderRadius: 10, marginBottom: 4,
                            fontSize: 14, fontWeight: 500,
                            color: isActive ? 'white' : 'var(--warning)',
                            background: isActive ? 'rgba(245,158,11,0.2)' : 'transparent',
                            textDecoration: 'none',
                        })}>
                            <Shield size={18} />
                            Admin Panel
                        </NavLink>
                    )}
                </nav>

                {/* User Footer */}
                <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 14, fontWeight: 700, color: 'white', flexShrink: 0,
                        }}>
                            {user?.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                            <p style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</p>
                            <p style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="btn btn-ghost btn-sm btn-full" style={{ justifyContent: 'flex-start' }}>
                        <LogOut size={16} />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="main-content">
                <div className="page-content">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
