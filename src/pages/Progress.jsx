import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { storage } from '../lib/storage.js';
import { calculateStreaks, getHeatmapData, getWeeklyData } from '../lib/streaks.js';
import { format, subWeeks, eachWeekOfInterval } from 'date-fns';

const COLORS = ['#6C63FF', '#00D9C0', '#FF6B6B', '#FFB347', '#A78BFA', '#34D399', '#F472B6', '#60A5FA'];

export default function Progress() {
    const [streaks, setStreaks] = useState({ current: 0, longest: 0 });
    const [heatmap, setHeatmap] = useState([]);
    const [weeklyData, setWeeklyData] = useState([]);
    const [subjectData, setSubjectData] = useState([]);
    const [totalHours, setTotalHours] = useState(0);
    const [totalDays, setTotalDays] = useState(0);

    useEffect(() => {
        const s = calculateStreaks();
        setStreaks(s);
        setHeatmap(getHeatmapData(91));
        setWeeklyData(getWeeklyData());

        const sessions = storage.get('sessions', []);
        const subMap = {};
        let total = 0;
        sessions.filter(s => s.completed).forEach(s => {
            subMap[s.subject] = (subMap[s.subject] || 0) + (s.duration || 60);
            total += s.duration || 60;
        });
        setTotalHours(Math.round(total / 60 * 10) / 10);
        setTotalDays(new Set(sessions.filter(s => s.completed).map(s => s.date)).size);
        setSubjectData(Object.entries(subMap).map(([name, minutes]) => ({ name, hours: Math.round(minutes / 60 * 10) / 10 })));
    }, []);

    // Group heatmap into weeks
    const weeks = [];
    for (let i = 0; i < heatmap.length; i += 7) weeks.push(heatmap.slice(i, i + 7));

    const statCards = [
        { icon: '🔥', label: 'Current Streak', value: `${streaks.current} days`, color: '#FFB347' },
        { icon: '🏆', label: 'Longest Streak', value: `${streaks.longest} days`, color: 'var(--primary)' },
        { icon: '⏱️', label: 'Total Hours', value: `${totalHours}h`, color: 'var(--accent)' },
        { icon: '📅', label: 'Days Studied', value: totalDays, color: '#A78BFA' },
    ];

    return (
        <div className="flex flex-col gap-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map(({ icon, label, value, color }, i) => (
                    <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        className="glass glass-hover p-5">
                        <div style={{ fontSize: '28px', marginBottom: '8px' }}>{icon}</div>
                        <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '24px', color }}>{value}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Heatmap */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="glass p-6">
                <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '16px', marginBottom: '16px' }}>🗓️ 90-Day Consistency Map</h3>
                <div style={{ overflowX: 'auto' }}>
                    <div style={{ display: 'flex', gap: '4px', minWidth: 'max-content' }}>
                        {weeks.map((week, wi) => (
                            <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {week.map(day => (
                                    <div key={day.date} className="heatmap-cell" data-level={day.level} title={`${day.date}: ${Math.round(day.minutes / 60 * 10) / 10}h`} />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '12px', fontSize: '11px', color: 'var(--text-muted)' }}>
                    <span>Less</span>
                    {[0, 1, 2, 3, 4].map(l => <div key={l} className="heatmap-cell" data-level={l} style={{ width: '12px', height: '12px' }} />)}
                    <span>More</span>
                </div>
            </motion.div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Weekly trend */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="glass p-6">
                    <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '16px', marginBottom: '16px' }}>📈 Weekly Study Hours</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={weeklyData}>
                            <XAxis dataKey="name" tick={{ fill: '#9090B0', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#9090B0', fontSize: 11 }} axisLine={false} tickLine={false} unit="h" />
                            <Tooltip contentStyle={{ background: '#1A1A2E', border: '1px solid rgba(108,99,255,0.3)', borderRadius: '10px', color: '#F0F0FF' }} />
                            <Bar dataKey="completed" fill="#6C63FF" radius={[6, 6, 0, 0]} name="Completed (h)" />
                            <Bar dataKey="planned" fill="rgba(108,99,255,0.2)" radius={[6, 6, 0, 0]} name="Planned (h)" />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Subject breakdown pie */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="glass p-6">
                    <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '16px', marginBottom: '16px' }}>📚 Subject Breakdown</h3>
                    {subjectData.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '13px' }}>No sessions logged yet</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie data={subjectData} dataKey="hours" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name }) => name}>
                                    {subjectData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip contentStyle={{ background: '#1A1A2E', border: '1px solid rgba(108,99,255,0.3)', borderRadius: '10px', color: '#F0F0FF' }} formatter={(val) => [`${val}h`, 'Hours']} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
