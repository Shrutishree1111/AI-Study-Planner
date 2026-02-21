import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw, Save, ChevronDown, Plus, Trash2, AlertCircle } from 'lucide-react';
import { storage } from '../lib/storage.js';
import { callGemini, generateSchedulePrompt } from '../lib/gemini.js';
import { generateRuleBasedSchedule } from '../lib/scheduler.js';
import toast from 'react-hot-toast';

const SUBJECT_COLORS = ['#6C63FF', '#00D9C0', '#FF6B6B', '#FFB347', '#A78BFA', '#34D399', '#F472B6', '#60A5FA'];

export default function Schedule() {
    const user = storage.get('user', {});
    const settings = storage.get('settings', {});
    const [loading, setLoading] = useState(false);
    const [schedule, setSchedule] = useState(storage.get('schedule', null));
    const [form, setForm] = useState({
        subjects: user.subjects || [],
        dailyGoal: user.dailyGoal || 4,
        studyStyle: user.studyStyle || 'pomodoro',
        exams: user.exams || [],
        preferredTime: 'morning',
    });
    const [subjectInput, setSubjectInput] = useState('');
    const [expandedDay, setExpandedDay] = useState(0);

    const addSubject = () => {
        if (subjectInput.trim() && !form.subjects.includes(subjectInput.trim())) {
            setForm(f => ({ ...f, subjects: [...f.subjects, subjectInput.trim()] }));
            setSubjectInput('');
        }
    };

    const generate = async () => {
        if (!form.subjects.length) { toast.error('Add at least one subject'); return; }
        setLoading(true);
        try {
            const apiKey = settings.geminiKey;
            let result;
            if (apiKey) {
                const prompt = generateSchedulePrompt({ ...form });
                const raw = await callGemini(prompt, apiKey);
                // Parse JSON — strip any markdown fences just in case
                const cleaned = raw.replace(/```json?/g, '').replace(/```/g, '').trim();
                const parsed = JSON.parse(cleaned);
                result = { ...parsed, generatedAt: new Date().toISOString(), source: 'ai' };
                // Add IDs to slots
                result.week = result.week.map((day, di) => ({
                    ...day,
                    slots: day.slots.map((slot, si) => ({ ...slot, id: `${di}-${si}`, completed: false }))
                }));
            } else {
                result = generateRuleBasedSchedule(form);
                toast('Generated with rule-based planner (add API key for AI schedules)', { icon: '⚡' });
            }
            setSchedule(result);
            storage.set('schedule', result);
            toast.success('Schedule generated successfully!');
        } catch (e) {
            console.error(e);
            const fallback = generateRuleBasedSchedule(form);
            setSchedule(fallback);
            storage.set('schedule', fallback);
            toast('AI failed, used rule-based fallback', { icon: '⚠️' });
        }
        setLoading(false);
    };

    const saveAndApply = () => {
        storage.set('schedule', schedule);
        toast.success('Schedule saved to your planner!');
    };

    const colorFor = (subject) => {
        const idx = (form.subjects.indexOf(subject) + (user.subjects || []).indexOf(subject)) % SUBJECT_COLORS.length;
        return SUBJECT_COLORS[Math.abs(idx)] || 'var(--primary)';
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Form Panel */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 glass p-6 h-fit">
                <h2 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '18px', marginBottom: '4px' }}>🤖 Generate Schedule</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '24px' }}>Configure your preferences and let AI build your plan</p>

                {!settings.geminiKey && (
                    <div style={{ background: 'rgba(255,179,71,0.1)', border: '1px solid rgba(255,179,71,0.3)', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                        <AlertCircle size={16} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: '1px' }} />
                        <p style={{ fontSize: '12px', color: 'var(--warning)' }}>No Gemini API key set. Using rule-based planner. Add key in Settings for AI schedules.</p>
                    </div>
                )}

                {/* Subjects */}
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>Subjects</label>
                    <div className="flex gap-2 mb-2">
                        <input className="input-field" placeholder="Add subject..." value={subjectInput}
                            onChange={e => setSubjectInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSubject()} />
                        <button onClick={addSubject} className="btn-primary" style={{ padding: '10px 14px', borderRadius: '10px' }}>
                            <Plus size={16} />
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {form.subjects.map((s, i) => (
                            <span key={s} className="tag" style={{ borderColor: SUBJECT_COLORS[i % SUBJECT_COLORS.length], color: SUBJECT_COLORS[i % SUBJECT_COLORS.length], background: `${SUBJECT_COLORS[i % SUBJECT_COLORS.length]}18` }}>
                                {s}
                                <button onClick={() => setForm(f => ({ ...f, subjects: f.subjects.filter(x => x !== s) }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}><span>×</span></button>
                            </span>
                        ))}
                    </div>
                </div>

                {/* Daily Goal */}
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>Daily Study Goal: <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{form.dailyGoal} hours</span></label>
                    <input type="range" min="1" max="12" value={form.dailyGoal}
                        onChange={e => setForm(f => ({ ...f, dailyGoal: Number(e.target.value) }))}
                        style={{ width: '100%', accentColor: 'var(--primary)' }} />
                </div>

                {/* Study Style */}
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>Study Style</label>
                    <div className="grid grid-cols-3 gap-2">
                        {[['pomodoro', '🍅', 'Pomodoro'], ['deep', '🎯', 'Deep Focus'], ['mixed', '🔀', 'Mixed']].map(([val, icon, label]) => (
                            <button key={val} onClick={() => setForm(f => ({ ...f, studyStyle: val }))}
                                style={{
                                    padding: '8px 4px', borderRadius: '10px', fontSize: '11px', border: form.studyStyle === val ? 'none' : '1px solid var(--border)',
                                    background: form.studyStyle === val ? 'linear-gradient(135deg,var(--primary),#8B5CF6)' : 'transparent',
                                    color: form.studyStyle === val ? 'white' : 'var(--text-muted)', cursor: 'pointer', fontFamily: 'Outfit', fontWeight: 600, transition: 'all 0.2s'
                                }}>
                                {icon} {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Preferred Time */}
                <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>Preferred Time</label>
                    <select className="input-field" value={form.preferredTime} onChange={e => setForm(f => ({ ...f, preferredTime: e.target.value }))}>
                        <option value="morning">🌅 Morning (6am–12pm)</option>
                        <option value="afternoon">☀️ Afternoon (12pm–5pm)</option>
                        <option value="evening">🌆 Evening (5pm–9pm)</option>
                        <option value="night">🌙 Night (9pm–12am)</option>
                    </select>
                </div>

                <button onClick={generate} disabled={loading} className="btn-primary w-full"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', opacity: loading ? 0.7 : 1 }}>
                    {loading ? <><RefreshCw size={16} className="animate-spin" /> Generating...</> : <><Sparkles size={16} /> Generate Schedule</>}
                </button>
            </motion.div>

            {/* Result Panel */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-3">
                {!schedule ? (
                    <div className="glass p-12 text-center h-full flex flex-col items-center justify-center">
                        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🗓️</div>
                        <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '22px', marginBottom: '8px' }}>No Schedule Yet</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Fill in your details and click "Generate Schedule" to create your AI-powered study plan.</p>
                    </div>
                ) : (
                    <div className="glass p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '18px' }}>Your 7-Day Plan</h3>
                                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{schedule.source === 'ai' ? '🤖 AI Generated' : '⚡ Rule-based'} · {new Date(schedule.generatedAt).toLocaleDateString()}</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={generate} disabled={loading} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', fontSize: '13px' }}>
                                    <RefreshCw size={14} /> Regenerate
                                </button>
                                <button onClick={saveAndApply} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', fontSize: '13px' }}>
                                    <Save size={14} /> Save
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            {schedule.week?.map((day, di) => (
                                <div key={day.day} className="glass" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                                    <button onClick={() => setExpandedDay(expandedDay === di ? -1 : di)}
                                        className="w-full flex items-center justify-between p-4" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)' }}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-primary-gradient" style={{ fontSize: '12px', fontWeight: 700, color: 'white', fontFamily: 'Outfit' }}>
                                                {day.day.slice(0, 2)}
                                            </div>
                                            <div style={{ textAlign: 'left' }}>
                                                <div style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: '14px' }}>{day.day}</div>
                                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{day.slots?.length || 0} sessions · {Math.round((day.slots || []).reduce((s, x) => s + x.duration, 0) / 60 * 10) / 10}h</div>
                                            </div>
                                        </div>
                                        <motion.div animate={{ rotate: expandedDay === di ? 180 : 0 }}>
                                            <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />
                                        </motion.div>
                                    </button>
                                    <AnimatePresence>
                                        {expandedDay === di && (
                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                                style={{ overflow: 'hidden', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                                <div className="p-4 flex flex-col gap-2">
                                                    {day.slots?.map(slot => (
                                                        <div key={slot.id} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                                            <div style={{ width: '4px', height: '40px', borderRadius: '2px', background: colorFor(slot.subject), flexShrink: 0 }} />
                                                            <div style={{ flex: 1 }}>
                                                                <div style={{ fontWeight: 600, fontSize: '14px' }}>{slot.subject}</div>
                                                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{slot.topic}</div>
                                                            </div>
                                                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{slot.time}</div>
                                                                <div style={{ fontSize: '11px', color: 'var(--accent)' }}>{slot.duration}min</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
