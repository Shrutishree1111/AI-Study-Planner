import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Navbar from './Navbar.jsx';
import { storage } from '../../lib/storage.js';

export default function AppLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const user = storage.get('user', {});

    return (
        <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
            {/* Desktop Sidebar */}
            <div className="hidden lg:block w-64 flex-shrink-0">
                <Sidebar open={true} onClose={() => { }} />
            </div>

            {/* Mobile Sidebar */}
            <div className="lg:hidden">
                <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            </div>

            {/* Main */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <Navbar onMenuClick={() => setSidebarOpen(true)} user={user} />
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
