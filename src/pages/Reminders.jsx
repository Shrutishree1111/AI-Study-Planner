import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Plus, Trash2, BellOff, Clock } from 'lucide-react';
import { storage } from '../lib/storage.js';
import toast from 'react-hot-toast';
import { v4 as uuid } from 'uuid';

export default function Reminders() {
    const [reminders, setReminders] = useState([]);
    const [showAdd, setShowAdd] = useState(false);
    const [form, setForm] = useState({ time: '08:00', label: '', enabled: true });
    const [notifPermission, setNotifPermission] = useState('default');

    useEffect(() => {
        setReminders(storage.get('reminders', []));
        if ('Notification' in window) setNotifPermission(Notification.permission);
    }, []);

    const requestPermission = async () => {
        if ('Notification' in window) {
            const perm = await Notification.requestPermission();
            setNotifPermission(perm);
            if (perm === 'granted') toast.success('Notifications enabled!');
        }
    };

    const addReminder = () => {
        if (!form.label.trim()) { toast.error('Enter a reminder label'); return; }
        const newReminder = { ...form, id: uuid() };
        const updated = [...reminders, newReminder];
        setReminders(updated);
        storage.set('reminders', updated);
        setForm({ time: '08:00', label: '', enabled: true });
        setShowAdd(false);
        toast.success('Reminder added!');
    };

    const toggleReminder = (id) => {
        const updated = reminders.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r);
        setReminders(updated);
        storage.set('reminders', updated);
    };

    const deleteReminder = (id) => {
        const updated = reminders.filter(r => r.id !== id);
        setReminders(updated);
        storage.set('reminders', updated);
        toast('Reminder removed', { icon: '🗑️' });
    };

    const testNotif = () => {
        if (notifPermission === 'granted') {
            new Notification('📚 StudyAI Reminder', { body: 'Time to hit the books! Your study session is starting.', icon: '/favicon.ico' });
        } else { requestPermission(); }
    };

    const QUICK_REMINDERS = [
        { time: '07:00', label: '🌅 Morning study session' },
        { time: '14:00', label: '☀️ Afternoon review' },
        { time: '19:00', label: '🌆 Evening session' },
        { time: '21:00', label: '🌙 Night wrap-up' },
    ];

    return (
        <div className="max-w-2xl mx-auto flex flex-col gap-6">
            {/* Notification Permission Banner */}
            {notifPermission !== 'granted' && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="glass p-4 flex items-center justify-between"
                    style={{ border: '1px solid rgba(255,179,71,0.3)', background: 'rgba(255,179,71,0.07)' }}>
                    <div className="flex items-center gap-3">
                        <BellOff size={18} style={{ color: 'var(--warning)' }} />
                        <p style={{ fontSize: '14px', color: 'var(--warning)' }}>Enable browser notifications to get study reminders</p>
                    </div>
                    <button onClick={requestPermission} className="btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>Enable</button>
                </motion.div>
            )}

            {/* Header */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '18px' }}>🔔 My Reminders</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '2px' }}>{reminders.filter(r => r.enabled).length} active reminders</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={testNotif} className="btn-secondary" style={{ padding: '8px 14px', fontSize: '13px' }}>Test</button>
                        <button onClick={() => setShowAdd(s => !s)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', fontSize: '13px' }}>
                            <Plus size={14} /> New
                        </button>
                    </div>
                </div>

                {/* Add form */}
                <AnimatePresence>
                    {showAdd && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                            style={{ overflow: 'hidden', marginBottom: '16px' }}>
                            <div style={{ padding: '16px', background: 'rgba(108,99,255,0.08)', borderRadius: '12px', border: '1px solid rgba(108,99,255,0.2)' }}>
                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    <div>
                                        <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Time</label>
                                        <input type="time" className="input-field" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Label</label>
                                        <input className="input-field" placeholder="e.g. Math session" value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} onKeyDown={e => e.key === 'Enter' && addReminder()} />
                                    </div>
                                </div>
                                <button onClick={addReminder} className="btn-primary w-full">Add Reminder</button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Reminders list */}
                {reminders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                        <Bell size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                        <p style={{ fontSize: '14px' }}>No reminders yet. Add one or pick a quick template below.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {reminders.map(r => (
                            <motion.div key={r.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-4 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: r.enabled ? 'rgba(108,99,255,0.15)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Clock size={18} style={{ color: r.enabled ? 'var(--primary)' : 'var(--text-muted)' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, fontSize: '14px', color: r.enabled ? 'var(--text)' : 'var(--text-muted)' }}>{r.label}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{r.time} daily</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => toggleReminder(r.id)} style={{ width: '44px', height: '24px', borderRadius: '999px', background: r.enabled ? 'var(--primary)' : 'var(--surface2)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'all 0.3s' }}>
                                        <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'white', position: 'absolute', top: '3px', transition: 'all 0.3s', left: r.enabled ? '22px' : '3px' }} />
                                    </button>
                                    <button onClick={() => deleteReminder(r.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: '4px' }}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* Quick templates */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="glass p-6">
                <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '16px', marginBottom: '12px' }}>⚡ Quick Templates</h3>
                <div className="grid grid-cols-2 gap-3">
                    {QUICK_REMINDERS.map(qr => (
                        <button key={qr.time} onClick={() => { const r = { ...qr, id: uuid(), enabled: true }; const updated = [...reminders, r]; setReminders(updated); storage.set('reminders', updated); toast.success('Reminder added!'); }}
                            className="glass glass-hover p-4 text-left" style={{ borderRadius: '12px', cursor: 'pointer', background: 'none', border: '1px solid var(--border)', color: 'var(--text)' }}>
                            <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '2px' }}>{qr.label}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{qr.time} every day</div>
                        </button>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
