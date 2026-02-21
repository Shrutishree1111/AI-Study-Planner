import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowRight, Flame, Target, Clock, BookOpen, TrendingUp } from 'lucide-react';
import { storage } from '../lib/storage.js';
import { calculateStreaks, getTodayProgress, getWeeklyData, getSessionsForDate } from '../lib/streaks.js';
import { generateDailyTip } from '../lib/gemini.js';

const cardVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: i => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } })
};

export default function Dashboard() {
    const navigate = useNavigate();
    const user = storage.get('user', {});
    const [streaks, setStreaks] = useState({ current: 0, longest: 0 });
    const [progress, setProgress] = useState({ completedMinutes: 0, goalMinutes: 240, percent: 0 });
    const [weeklyData, setWeeklyData] = useState([]);
    const [todaySessions, setTodaySessions] = useState([]);
    const [tip, setTip] = useState('');
    const [schedule, setSchedule] = useState(null);

    useEffect(() => {
        setStreaks(calculateStreaks());
        setProgress(getTodayProgress());
        setWeeklyData(getWeeklyData());
        const sc = storage.get('schedule', null);
        setSchedule(sc);
        // Get today's slots from schedule
        const today = new Date().toLocaleDateString('en-CA');
        const dayPlan = sc?.week?.find(d => d.date === today);
        setTodaySessions(dayPlan?.slots || []);
        // Fetch AI tip
        const settings = storage.get('settings', {});
        generateDailyTip(user.subjects || [], settings.geminiKey).then(setTip);
    }, []);

    const toggleSession = (id) => {
        setTodaySessions(prev => prev.map(s => s.id === id ? { ...s, completed: !s.completed } : s));
        // Update streak
        setStreaks(calculateStreaks());
        setProgress(getTodayProgress());
    };

    const exams = user.exams || [];
    const today = new Date();

    return (
        <div>
            {/* Welcome */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '28px' }}>
                    Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user.name || 'Student'} 👋
                </h2>
                <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
                    {streaks.current > 0 ? `You're on a ${streaks.current}-day streak! Keep going 🔥` : "Start your first study session to begin your streak!"}
                </p>
            </motion.div>

            {/* Top stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                    { icon: '🔥', label: 'Current Streak', value: `${streaks.current}d`, color: '#FFB347', bg: 'rgba(255,179,71,0.1)', i: 0 },
                    { icon: '🏆', label: 'Longest Streak', value: `${streaks.longest}d`, color: 'var(--primary)', bg: 'rgba(108,99,255,0.1)', i: 1 },
                    { icon: '⏱️', label: "Today's Goal", value: `${Math.round(progress.completedMinutes / 60 * 10) / 10}/${user.dailyGoal || 4}h`, color: 'var(--accent)', bg: 'rgba(0,217,192,0.1)', i: 2 },
                    { icon: '📚', label: 'Subjects', value: (user.subjects || []).length, color: '#A78BFA', bg: 'rgba(167,139,250,0.1)', i: 3 },
                ].map(({ icon, label, value, color, bg, i }) => (
                    <motion.div key={label} custom={i} variants={cardVariants} initial="hidden" animate="visible"
                        className="glass glass-hover p-5" style={{ borderRadius: '16px' }}>
                        <div style={{ fontSize: '28px', marginBottom: '8px' }}>{icon}</div>
                        <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '24px', color }}>{value}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{label}</div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Today's Goal Progress */}
                <motion.div custom={4} variants={cardVariants} initial="hidden" animate="visible" className="glass p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '16px' }}>Today's Progress</h3>
                        <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent)' }}>{progress.percent}%</span>
                    </div>
                    <div className="progress-bar mb-4">
                        <motion.div className="progress-fill" initial={{ width: 0 }} animate={{ width: `${progress.percent}%` }} transition={{ duration: 1, delay: 0.5 }} />
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        {Math.round(progress.completedMinutes)} / {progress.goalMinutes} minutes completed
                    </p>
                </motion.div>

                {/* AI Tip */}
                <motion.div custom={5} variants={cardVariants} initial="hidden" animate="visible" className="glass p-6"
                    style={{ background: 'linear-gradient(135deg, rgba(108,99,255,0.15), rgba(0,217,192,0.08))' }}>
                    <div className="flex items-center gap-2 mb-3">
                        <span style={{ fontSize: '20px' }}>🧠</span>
                        <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '16px' }}>AI Study Tip</h3>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.7 }}>{tip || 'Loading tip...'}</p>
                </motion.div>

                {/* Exam Countdown */}
                <motion.div custom={6} variants={cardVariants} initial="hidden" animate="visible" className="glass p-6">
                    <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '16px', marginBottom: '12px' }}>📅 Exam Countdown</h3>
                    {exams.length === 0 ? (
                        <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', paddingTop: '16px' }}>
                            No exams added yet.<br />
                            <button onClick={() => navigate('/settings')} style={{ color: 'var(--primary)', marginTop: '8px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}>Add exam dates →</button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {exams.slice(0, 3).map((exam, i) => {
                                const days = Math.ceil((new Date(exam.date) - today) / 86400000);
                                const color = days <= 7 ? 'var(--danger)' : days <= 14 ? 'var(--warning)' : 'var(--accent)';
                                return (
                                    <div key={i} className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <span style={{ fontSize: '14px' }}>{exam.subject}</span>
                                        <span style={{ fontFamily: 'Outfit', fontWeight: 700, color, fontSize: '13px' }}>{days > 0 ? `${days}d left` : 'Today!'}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Weekly Chart + Today's Plan */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {/* Weekly Chart */}
                <motion.div custom={7} variants={cardVariants} initial="hidden" animate="visible" className="glass p-6">
                    <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '16px', marginBottom: '20px' }}>📈 Weekly Overview</h3>
                    <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={weeklyData} barGap={4}>
                            <XAxis dataKey="name" tick={{ fill: '#9090B0', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#9090B0', fontSize: 11 }} axisLine={false} tickLine={false} unit="h" />
                            <Tooltip contentStyle={{ background: '#1A1A2E', border: '1px solid rgba(108,99,255,0.3)', borderRadius: '10px', color: '#F0F0FF' }} />
                            <Bar dataKey="completed" fill="#6C63FF" radius={[6, 6, 0, 0]} name="Completed" />
                            <Bar dataKey="planned" fill="rgba(108,99,255,0.2)" radius={[6, 6, 0, 0]} name="Planned" />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Today's Sessions */}
                <motion.div custom={8} variants={cardVariants} initial="hidden" animate="visible" className="glass p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '16px' }}>📋 Today's Plan</h3>
                        <button onClick={() => navigate('/planner')} style={{ fontSize: '12px', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}>See all →</button>
                    </div>
                    {todaySessions.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: '14px' }}>
                            No sessions planned today.<br />
                            <button onClick={() => navigate('/schedule')} style={{ color: 'var(--primary)', marginTop: '8px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}>Generate AI Schedule →</button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {todaySessions.slice(0, 4).map(session => (
                                <div key={session.id} className="flex items-center gap-3 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <input type="checkbox" checked={session.completed} onChange={() => toggleSession(session.id)}
                                        style={{ accentColor: 'var(--primary)', width: '16px', height: '16px', cursor: 'pointer' }} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '14px', fontWeight: 500, textDecoration: session.completed ? 'line-through' : 'none', color: session.completed ? 'var(--text-muted)' : 'var(--text)' }}>{session.subject}</div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{session.time} · {session.duration}min</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
