import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    LayoutDashboard, Calendar, BookOpen, BarChart2,
    Bell, Settings, Zap, X, ShieldCheck, Flame
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const links = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/schedule', icon: Calendar, label: 'AI Schedule' },
    { to: '/planner', icon: BookOpen, label: 'Daily Planner' },
    { to: '/progress', icon: BarChart2, label: 'Progress' },
    { to: '/reminders', icon: Bell, label: 'Reminders' },
    { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar({ open, onClose }) {
    const { user } = useAuth();

    const navLinks = [...links];
    if (user?.role === 'admin') {
        navLinks.push({ to: '/admin', icon: ShieldCheck, label: 'Admin Panel' });
    }

    return (
        <>
            {/* Mobile backdrop */}
            {open && (
                <div
                    className="fixed inset-0 bg-black/60 z-30 lg:hidden"
                    onClick={onClose}
                />
            )}

            <motion.aside
                initial={{ x: -280 }}
                animate={{ x: open ? 0 : -280 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="fixed top-0 left-0 h-full w-64 z-40 lg:translate-x-0 lg:static lg:z-auto"
                style={{ background: '#0D0D1E', borderRight: '1px solid rgba(108,99,255,0.15)' }}
            >
                {/* Logo */}
                <div className="flex items-center justify-between p-5 mb-2">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-primary-gradient glow-primary">
                            <Zap size={18} color="white" />
                        </div>
                        <div>
                            <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '15px', color: '#F0F0FF' }}>StudyAI</div>
                            <div style={{ fontSize: '11px', color: '#9090B0' }}>Consistency Planner</div>
                        </div>
                    </div>
                    <button onClick={onClose} className="lg:hidden" style={{ color: '#9090B0' }}>
                        <X size={18} />
                    </button>
                </div>

                {/* Nav */}
                <nav className="px-3 flex flex-col gap-1">
                    {navLinks.map(({ to, icon: Icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            onClick={onClose}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium group ${isActive ? 'nav-active' : 'text-muted hover:bg-white/5'
                                }`
                            }
                            style={({ isActive }) => ({ color: isActive ? 'var(--primary)' : 'var(--text-muted)' })}
                        >
                            {({ isActive }) => (
                                <>
                                    <Icon size={18} style={{ color: isActive ? 'var(--primary)' : 'var(--text-muted)' }} />
                                    <span>{label}</span>
                                    {isActive && (
                                        <motion.div
                                            layoutId="sidebar-indicator"
                                            className="ml-auto w-1.5 h-1.5 rounded-full"
                                            style={{ background: 'var(--primary)' }}
                                        />
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Bottom CTA */}
                <div className="absolute bottom-6 left-0 right-0 px-4">
                    <div className="glass p-4 rounded-xl text-center flex flex-col items-center">
                        <Flame size={28} className="text-[#FFB347] mb-1" />
                        <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '22px', color: '#FFB347' }} id="sidebar-streak">0</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Day Streak</div>
                    </div>
                </div>
            </motion.aside>
        </>
    );
}
