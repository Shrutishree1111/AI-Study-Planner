import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Users, Clock, Calendar, ShieldCheck, Search, Trash2, Key } from 'lucide-react';

export default function Admin() {
    const { user, API_URL } = useAuth();
    const [stats, setStats] = useState({ totalUsers: 0, totalHours: 0, activeSchedules: 0 });
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('study_token');
        const fetchData = async () => {
            const statsRes = await fetch(`${API_URL}/admin/stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const statsData = await statsRes.json();
            setStats(statsData);

            const usersRes = await fetch(`${API_URL}/admin/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const usersData = await usersRes.json();
            setUsers(usersData);
        };
        fetchData();
    }, [API_URL]);

    const filteredUsers = users.filter(u =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-8">
            <header className="flex items-center gap-3">
                <ShieldCheck size={32} className="text-primary" />
                <div>
                    <h1 className="text-2xl font-bold font-outfit">Admin Control Panel</h1>
                    <p className="text-text-muted text-sm">System oversight and user management</p>
                </div>
            </header>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'var(--primary)' },
                    { label: 'Platform Hours', value: stats.totalHours, icon: Clock, color: 'var(--accent)' },
                    { label: 'Active Plans', value: stats.activeSchedules, icon: Calendar, color: 'var(--success)' },
                ].map((s, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass p-6 flex items-center justify-between"
                    >
                        <div>
                            <p className="text-text-muted text-sm mb-1">{s.label}</p>
                            <h2 className="text-3xl font-extrabold" style={{ color: s.color }}>{s.value}</h2>
                        </div>
                        <s.icon size={48} style={{ color: s.color, opacity: 0.2 }} />
                    </motion.div>
                ))}
            </div>

            {/* User Management */}
            <div className="glass p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <h3 className="text-lg font-bold">Manage Users</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                        <input
                            className="input-field pl-10"
                            placeholder="Search by name or email..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-text-muted text-xs uppercase tracking-wider border-b border-white/5">
                                <th className="pb-4 px-2">User</th>
                                <th className="pb-4 px-2">Role</th>
                                <th className="pb-4 px-2">Goal</th>
                                <th className="pb-4 px-2">Joined</th>
                                <th className="pb-4 px-2 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredUsers.map(u => (
                                <tr key={u.id} className="text-sm hover:bg-white/[0.02] transition-colors">
                                    <td className="py-4 px-2 text-ellipsis overflow-hidden">
                                        <div className="font-bold">{u.name}</div>
                                        <div className="text-xs text-text-muted">{u.email}</div>
                                    </td>
                                    <td className="py-4 px-2">
                                        <span className={`tag text-[10px] ${u.role === 'admin' ? 'border-primary text-primary' : 'border-text-muted text-text-muted'}`}>
                                            {u.role.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="py-4 px-2 font-mono text-primary">{u.daily_goal}h</td>
                                    <td className="py-4 px-2 text-text-muted text-xs">
                                        {new Date(u.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="py-4 px-2 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="p-2 text-text-muted hover:text-primary transition-colors ring-1 ring-white/10 rounded-lg">
                                                <Key size={14} />
                                            </button>
                                            <button className="p-2 text-text-muted hover:text-danger transition-colors ring-1 ring-white/10 rounded-lg">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredUsers.length === 0 && (
                        <div className="text-center py-10 text-text-muted">No users found matching your search.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
