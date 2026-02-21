import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Trash2, Plus, Key, Bell, Moon, Download } from 'lucide-react';
import { storage } from '../lib/storage.js';
import toast from 'react-hot-toast';

export default function Settings() {
    const [user, setUser] = useState(storage.get('user', {}));
    const [settings, setSettings] = useState(storage.get('settings', { darkMode: true, notifications: true, geminiKey: '' }));
    const [subjectInput, setSubjectInput] = useState('');
    const [examInput, setExamInput] = useState({ subject: '', date: '' });

    const save = () => {
        storage.set('user', user);
        storage.set('settings', settings);
        toast.success('Settings saved!');
    };

    const exportData = () => {
        const data = {
            user: storage.get('user'),
            schedule: storage.get('schedule'),
            sessions: storage.get('sessions'),
            streaks: storage.get('streaks'),
            reminders: storage.get('reminders'),
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'studyai-backup.json'; a.click();
        toast.success('Data exported!');
    };

    const clearData = () => {
        if (window.confirm('Are you sure? This will delete ALL your data.')) {
            storage.clear();
            toast('All data cleared', { icon: '🗑️' });
        }
    };

    const addSubject = () => {
        if (subjectInput.trim() && !user.subjects?.includes(subjectInput.trim())) {
            setUser(u => ({ ...u, subjects: [...(u.subjects || []), subjectInput.trim()] }));
            setSubjectInput('');
        }
    };

    const addExam = () => {
        if (examInput.subject && examInput.date) {
            setUser(u => ({ ...u, exams: [...(u.exams || []), { ...examInput }] }));
            setExamInput({ subject: '', date: '' });
        }
    };

    return (
        <div className="max-w-2xl mx-auto flex flex-col gap-6">
            {/* Profile */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass p-6">
                <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '17px', marginBottom: '20px' }}>👤 Profile</h3>
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>Your Name</label>
                    <input className="input-field" placeholder="Your name" value={user.name || ''} onChange={e => setUser(u => ({ ...u, name: e.target.value }))} />
                </div>
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>Daily Study Goal: <strong style={{ color: 'var(--primary)' }}>{user.dailyGoal || 4}h</strong></label>
                    <input type="range" min="1" max="12" value={user.dailyGoal || 4} onChange={e => setUser(u => ({ ...u, dailyGoal: Number(e.target.value) }))} style={{ width: '100%', accentColor: 'var(--primary)' }} />
                </div>
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>Subjects</label>
                    <div className="flex gap-2 mb-2">
                        <input className="input-field" placeholder="Add subject" value={subjectInput} onChange={e => setSubjectInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSubject()} />
                        <button onClick={addSubject} className="btn-primary" style={{ padding: '10px 14px', borderRadius: '10px' }}><Plus size={16} /></button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {(user.subjects || []).map(s => (
                            <span key={s} className="tag" style={{ cursor: 'pointer' }} onClick={() => setUser(u => ({ ...u, subjects: u.subjects.filter(x => x !== s) }))}>
                                {s} ×
                            </span>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Exam Dates */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass p-6">
                <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '17px', marginBottom: '20px' }}>📅 Exam Dates</h3>
                <div className="flex gap-2 mb-3">
                    <select className="input-field" value={examInput.subject} onChange={e => setExamInput(ei => ({ ...ei, subject: e.target.value }))}>
                        <option value="">Select Subject</option>
                        {(user.subjects || []).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <input type="date" className="input-field" value={examInput.date} onChange={e => setExamInput(ei => ({ ...ei, date: e.target.value }))} />
                    <button onClick={addExam} className="btn-primary" style={{ padding: '10px 14px', borderRadius: '10px' }}><Plus size={16} /></button>
                </div>
                <div className="flex flex-col gap-2">
                    {(user.exams || []).map((exam, i) => (
                        <div key={i} className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '14px' }}>
                            <span>{exam.subject}</span>
                            <div className="flex items-center gap-3">
                                <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{exam.date}</span>
                                <button onClick={() => setUser(u => ({ ...u, exams: u.exams.filter((_, j) => j !== i) }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}><Trash2 size={14} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* AI & Notifications */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass p-6">
                <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '17px', marginBottom: '20px' }}>⚙️ Preferences</h3>
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                        <Key size={13} style={{ display: 'inline', marginRight: '6px' }} />Google Gemini API Key
                    </label>
                    <input className="input-field" type="password" placeholder="AIza..." value={settings.geminiKey || ''} onChange={e => setSettings(s => ({ ...s, geminiKey: e.target.value }))} />
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>Get a free key at <a href="https://aistudio.google.com" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>aistudio.google.com</a>. Stored locally only.</p>
                </div>
                <div className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div>
                        <div style={{ fontSize: '14px', fontWeight: 500 }}><Bell size={14} style={{ display: 'inline', marginRight: '6px' }} />Browser Notifications</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Receive study session reminders</div>
                    </div>
                    <button onClick={() => setSettings(s => ({ ...s, notifications: !s.notifications }))} style={{ width: '44px', height: '24px', borderRadius: '999px', background: settings.notifications ? 'var(--primary)' : 'var(--surface2)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'all 0.3s' }}>
                        <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'white', position: 'absolute', top: '3px', transition: 'all 0.3s', left: settings.notifications ? '22px' : '3px' }} />
                    </button>
                </div>
            </motion.div>

            {/* Save button */}
            <motion.button onClick={save} className="btn-primary w-full" whileHover={{ scale: 1.02 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                style={{ padding: '14px', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <Save size={18} /> Save Settings
            </motion.button>

            {/* Data management */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="glass p-6">
                <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '17px', marginBottom: '16px' }}>💾 Data Management</h3>
                <div className="flex gap-3">
                    <button onClick={exportData} className="btn-secondary flex-1" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <Download size={16} /> Export Backup
                    </button>
                    <button onClick={clearData} style={{ flex: 1, padding: '11px 20px', borderRadius: '12px', background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', color: 'var(--danger)', cursor: 'pointer', fontFamily: 'Outfit', fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}>
                        <Trash2 size={16} /> Clear All Data
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
