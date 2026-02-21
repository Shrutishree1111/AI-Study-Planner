import { Menu, Bell, User } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const PAGE_TITLES = {
    '/dashboard': 'Dashboard',
    '/schedule': 'AI Schedule Generator',
    '/planner': 'Daily Planner',
    '/progress': 'Progress Tracker',
    '/reminders': 'Reminders',
    '/settings': 'Settings',
};

export default function Navbar({ onMenuClick, user }) {
    const { pathname } = useLocation();
    const title = PAGE_TITLES[pathname] || 'StudyAI';
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    return (
        <header style={{ borderBottom: '1px solid rgba(108,99,255,0.12)', background: 'rgba(10,10,24,0.8)', backdropFilter: 'blur(12px)' }}
            className="sticky top-0 z-20 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <button onClick={onMenuClick} className="lg:hidden p-2 rounded-xl" style={{ color: 'var(--text-muted)', background: 'rgba(255,255,255,0.04)' }}>
                    <Menu size={20} />
                </button>
                <div>
                    <h1 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '20px', color: 'var(--text)' }}>{title}</h1>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{today}</p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl glass flex items-center justify-center cursor-pointer glass-hover">
                    <Bell size={16} style={{ color: 'var(--text-muted)' }} />
                </div>
                <div className="flex items-center gap-2 px-3 py-2 glass rounded-xl cursor-pointer glass-hover">
                    <div className="w-6 h-6 rounded-full bg-primary-gradient flex items-center justify-center">
                        <User size={12} color="white" />
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)' }}>
                        {user?.name || 'Student'}
                    </span>
                </div>
            </div>
        </header>
    );
}
