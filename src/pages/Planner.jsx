import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Check, SkipForward, Plus, Clock } from 'lucide-react';
import { storage } from '../lib/storage.js';
import { logSession, getTodayProgress } from '../lib/streaks.js';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

function PomodoroTimer({ onComplete }) {
    const [mode, setMode] = useState('work'); // 'work' | 'break'
    const [duration, setDuration] = useState(25 * 60);
    const [remaining, setRemaining] = useState(25 * 60);
    const [running, setRunning] = useState(false);
    const intervalRef = useRef(null);

    useEffect(() => {
        if (running) {
            intervalRef.current = setInterval(() => {
                setRemaining(r => {
                    if (r <= 1) {
                        clearInterval(intervalRef.current);
                        setRunning(false);
                        if (mode === 'work') { toast.success('🎉 Focus session complete! Take a break.'); onComplete && onComplete(25); setMode('break'); setRemaining(5 * 60); }
                        else { toast('Break over! Ready to focus again?', { icon: '💪' }); setMode('work'); setRemaining(25 * 60); }
                        return 0;
                    }
                    return r - 1;
                });
            }, 1000);
        } else { clearInterval(intervalRef.current); }
        return () => clearInterval(intervalRef.current);
    }, [running, mode]);

    const mins = String(Math.floor(remaining / 60)).padStart(2, '0');
    const secs = String(remaining % 60).padStart(2, '0');
    const pct = ((duration - remaining) / duration) * 100;

    const reset = () => { setRunning(false); setRemaining(mode === 'work' ? 25 * 60 : 5 * 60); };

    return (
        <div className="glass p-6 text-center">
            <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>⏱️ Pomodoro Timer</h3>
            <div style={{ fontSize: '12px', color: mode === 'work' ? 'var(--primary)' : 'var(--accent)', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {mode === 'work' ? 'Focus Session' : 'Break Time'}
            </div>

            {/* Circular progress */}
            <div style={{ position: 'relative', width: '140px', height: '140px', margin: '0 auto 20px' }}>
                <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="70" cy="70" r="60" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                    <circle cx="70" cy="70" r="60" fill="none" stroke={mode === 'work' ? '#6C63FF' : '#00D9C0'} strokeWidth="8"
                        strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 60}`}
                        strokeDashoffset={`${2 * Math.PI * 60 * (1 - pct / 100)}`} style={{ transition: 'stroke-dashoffset 1s linear' }} />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Outfit', fontWeight: 800, fontSize: '32px' }}>
                    {mins}:{secs}
                </div>
            </div>

            <div className="flex justify-center gap-3">
                <button onClick={reset} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                    <RotateCcw size={16} />
                </button>
                <button onClick={() => setRunning(r => !r)} className="btn-primary" style={{ width: '56px', height: '56px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {running ? <Pause size={22} /> : <Play size={22} />}
                </button>
                <button onClick={() => { setMode(m => m === 'work' ? 'break' : 'work'); setRunning(false); setRemaining(mode === 'work' ? 5 * 60 : 25 * 60); }}
                    style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                    <SkipForward size={16} />
                </button>
            </div>
        </div>
    );
}

export default function Planner() {
    const [sessions, setSessions] = useState([]);
    const [progress, setProgress] = useState({ completedMinutes: 0, goalMinutes: 240, percent: 0 });
    const [showAdd, setShowAdd] = useState(false);
    const [newTask, setNewTask] = useState({ subject: '', topic: '', duration: 60 });

    useEffect(() => {
        const schedule = storage.get('schedule', null);
        const today = format(new Date(), 'yyyy-MM-dd');
        const dayPlan = schedule?.week?.find(d => d.date === today);
        const existingSessions = storage.get('today_sessions', dayPlan?.slots || []);
        setSessions(existingSessions);
        setProgress(getTodayProgress());
    }, []);

    const toggleSession = (id) => {
        setSessions(prev => {
            const updated = prev.map(s => {
                if (s.id !== id) return s;
                const completed = !s.completed;
                if (completed) {
                    logSession({ subject: s.subject, duration: s.duration, completed: true, id: s.id });
                }
                return { ...s, completed };
            });
            storage.set('today_sessions', updated);
            setProgress(getTodayProgress());
            return updated;
        });
    };

    const addCustomTask = () => {
        if (!newTask.subject) { toast.error('Enter a subject'); return; }
        const id = `custom-${Date.now()}`;
        const task = { ...newTask, id, time: 'Custom', completed: false };
        setSessions(prev => { const updated = [...prev, task]; storage.set('today_sessions', updated); return updated; });
        setNewTask({ subject: '', topic: '', duration: 60 });
        setShowAdd(false);
        toast.success('Task added!');
    };

    const completed = sessions.filter(s => s.completed).length;
    const user = storage.get('user', {});

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sessions */}
            <div className="lg:col-span-2">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2">
                        <h2 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '18px' }}>
                            📋 Today's Sessions
                        </h2>
                        <button onClick={() => setShowAdd(s => !s)} className="btn-secondary"
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', fontSize: '13px' }}>
                            <Plus size={14} /> Add Task
                        </button>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                        {completed}/{sessions.length} sessions completed · {progress.percent}% of daily goal
                    </p>

                    {/* Progress bar */}
                    <div className="progress-bar mb-6">
                        <motion.div className="progress-fill" animate={{ width: `${progress.percent}%` }} transition={{ duration: 0.6 }} />
                    </div>

                    {/* Add task form */}
                    <AnimatePresence>
                        {showAdd && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                style={{ overflow: 'hidden', marginBottom: '16px' }}>
                                <div className="glass p-4" style={{ borderColor: 'rgba(108,99,255,0.3)', borderRadius: '12px' }}>
                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                        <input className="input-field" placeholder="Subject" value={newTask.subject} onChange={e => setNewTask(t => ({ ...t, subject: e.target.value }))} />
                                        <input className="input-field" placeholder="Topic (optional)" value={newTask.topic} onChange={e => setNewTask(t => ({ ...t, topic: e.target.value }))} />
                                    </div>
                                    <div className="flex gap-3 items-center">
                                        <select className="input-field" value={newTask.duration} onChange={e => setNewTask(t => ({ ...t, duration: Number(e.target.value) }))}>
                                            {[25, 30, 45, 60, 90, 120].map(d => <option key={d} value={d}>{d} minutes</option>)}
                                        </select>
                                        <button onClick={addCustomTask} className="btn-primary" style={{ whiteSpace: 'nowrap', padding: '10px 20px' }}>Add</button>
                                        <button onClick={() => setShowAdd(false)} className="btn-secondary" style={{ padding: '10px' }}>✕</button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Session list */}
                    {sessions.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
                            <p style={{ fontSize: '14px' }}>No sessions for today.<br />Generate a schedule or add tasks manually.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {sessions.map((s, i) => (
                                <motion.div key={s.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                                    className="flex items-center gap-4 p-4 rounded-xl glass-hover"
                                    style={{ background: s.completed ? 'rgba(0,217,192,0.05)' : 'rgba(255,255,255,0.02)', border: `1px solid ${s.completed ? 'rgba(0,217,192,0.2)' : 'rgba(255,255,255,0.05)'}`, cursor: 'pointer' }}
                                    onClick={() => toggleSession(s.id)}>
                                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: `2px solid ${s.completed ? 'var(--accent)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: s.completed ? 'var(--accent)' : 'transparent', transition: 'all 0.3s' }}>
                                        {s.completed && <Check size={14} color="white" />}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, fontSize: '15px', textDecoration: s.completed ? 'line-through' : 'none', color: s.completed ? 'var(--text-muted)' : 'var(--text)' }}>{s.subject}</div>
                                        {s.topic && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{s.topic}</div>}
                                    </div>
                                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{s.time}</div>
                                        <div style={{ fontSize: '11px', color: s.completed ? 'var(--accent)' : 'var(--primary)', fontWeight: 600 }}>{s.duration}min</div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Sidebar: Pomodoro + Stats */}
            <div className="flex flex-col gap-4">
                <PomodoroTimer onComplete={(mins) => { setProgress(getTodayProgress()); }} />
                <div className="glass p-6">
                    <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '16px', marginBottom: '12px' }}>📊 Today's Stats</h3>
                    {[
                        { label: 'Sessions done', value: `${completed}/${sessions.length}` },
                        { label: 'Minutes studied', value: `${progress.completedMinutes}` },
                        { label: 'Daily goal', value: `${user.dailyGoal || 4}h` },
                        { label: 'Completion', value: `${progress.percent}%` },
                    ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '13px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                            <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
