import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Zap, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(form.email, form.password);
            toast.success('Welcome back!');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'radial-gradient(ellipse at top, rgba(99,102,241,0.15) 0%, var(--bg-primary) 60%)',
            padding: 20,
        }}>
            <div style={{ width: '100%', maxWidth: 420 }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <div style={{
                        width: 56, height: 56,
                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                        borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 16px', boxShadow: 'var(--shadow-glow)',
                    }}>
                        <Zap size={28} color="white" />
                    </div>
                    <h1 style={{ fontSize: 28, fontWeight: 800 }}>Welcome back</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>Sign in to your Schedulr account</p>
                </div>

                <div className="card" style={{ padding: 32 }}>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type="email"
                                    className="form-input"
                                    style={{ paddingLeft: 40 }}
                                    placeholder="you@example.com"
                                    value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="form-input"
                                    style={{ paddingLeft: 40, paddingRight: 40 }}
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={e => setForm({ ...form, password: e.target.value })}
                                    required
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: 8 }}>
                            {loading ? <span className="loading-spinner"></span> : 'Sign In'}
                        </button>
                    </form>

                    <div className="divider" />

                    <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 14 }}>
                        Don't have an account?{' '}
                        <Link to="/register" style={{ color: 'var(--primary-light)', fontWeight: 600 }}>Create one free</Link>
                    </p>
                </div>

            </div>
        </div>
    );
}
