import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Calendar, BarChart2, Bell, ArrowRight, X, Plus, Trash2 } from 'lucide-react';
import { storage } from '../lib/storage.js';
import toast from 'react-hot-toast';

const FEATURES = [
    { icon: '🤖', title: 'AI-Powered Schedule', desc: 'Gemini AI creates a personalized timetable based on your subjects, goals, and exam dates.' },
    { icon: '🔥', title: 'Streak Tracking', desc: 'Build unstoppable momentum with daily streaks and a GitHub-style consistency heatmap.' },
    { icon: '🔔', title: 'Smart Reminders', desc: 'Browser notifications keep you on track so you never miss a study session again.' },
];

const STEPS = [
    { num: '01', title: 'Set Your Profile', desc: 'Tell us your subjects, daily study goal, and upcoming exam dates.' },
    { num: '02', title: 'Generate Your Schedule', desc: 'AI creates a personalized 7-day study plan optimized for your goals.' },
    { num: '03', title: 'Track & Improve', desc: 'Log sessions, build streaks, and watch your consistency score soar.' },
];

function OnboardingModal({ onClose }) {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({ name: '', subjects: [], dailyGoal: 4, studyStyle: 'pomodoro', exams: [] });
    const [subjectInput, setSubjectInput] = useState('');

    const addSubject = () => {
        if (subjectInput.trim() && !form.subjects.includes(subjectInput.trim())) {
            setForm(f => ({ ...f, subjects: [...f.subjects, subjectInput.trim()] }));
            setSubjectInput('');
        }
    };

    const addExam = () => {
        setForm(f => ({ ...f, exams: [...f.exams, { subject: '', date: '' }] }));
    };

    const handleFinish = () => {
        if (!form.name.trim()) { toast.error('Please enter your name'); return; }
        if (!form.subjects.length) { toast.error('Add at least one subject'); return; }
        storage.set('user', form);
        toast.success(`Welcome, ${form.name}! Your profile is set.`);
        navigate('/dashboard');
    };

    return (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
            <motion.div className="w-full max-w-lg glass p-8 relative"
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}>
                <button onClick={onClose} className="absolute top-4 right-4" style={{ color: 'var(--text-muted)' }}>
                    <X size={20} />
                </button>

                {/* Progress */}
                <div className="flex gap-2 mb-8">
                    {[1, 2, 3].map(s => (
                        <div key={s} className="flex-1 h-1 rounded-full" style={{ background: s <= step ? 'var(--primary)' : 'var(--surface2)' }} />
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div key="1" initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -30, opacity: 0 }}>
                            <h2 style={{ fontFamily: 'Outfit', fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>👋 What's your name?</h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '14px' }}>Let's personalize your experience</p>
                            <input className="input-field" placeholder="Enter your name" value={form.name}
                                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                onKeyDown={e => e.key === 'Enter' && setStep(2)} />
                            <div style={{ marginTop: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>Daily Study Goal (hours)</label>
                                <input type="range" min="1" max="12" value={form.dailyGoal}
                                    onChange={e => setForm(f => ({ ...f, dailyGoal: Number(e.target.value) }))}
                                    style={{ width: '100%', accentColor: 'var(--primary)' }} />
                                <div style={{ textAlign: 'center', color: 'var(--primary)', fontWeight: 700, fontSize: '20px', marginTop: '4px' }}>
                                    {form.dailyGoal} hrs / day
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div key="2" initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -30, opacity: 0 }}>
                            <h2 style={{ fontFamily: 'Outfit', fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>📚 Your Subjects</h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '14px' }}>Add the subjects you want to study</p>
                            <div className="flex gap-2 mb-4">
                                <input className="input-field" placeholder="e.g. Mathematics" value={subjectInput}
                                    onChange={e => setSubjectInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && addSubject()} />
                                <button onClick={addSubject} className="btn-primary" style={{ padding: '10px 16px', borderRadius: '10px' }}>
                                    <Plus size={18} />
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {form.subjects.map(s => (
                                    <span key={s} className="tag" style={{ cursor: 'pointer' }}
                                        onClick={() => setForm(f => ({ ...f, subjects: f.subjects.filter(x => x !== s) }))}>
                                        {s} <X size={12} />
                                    </span>
                                ))}
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>Study Style</label>
                                <div className="flex gap-2">
                                    {['pomodoro', 'deep', 'mixed'].map(style => (
                                        <button key={style} onClick={() => setForm(f => ({ ...f, studyStyle: style }))}
                                            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${form.studyStyle === style ? 'btn-primary' : 'btn-secondary'}`}
                                            style={{ fontSize: '12px', padding: '8px 4px' }}>
                                            {style === 'pomodoro' ? '🍅 Pomodoro' : style === 'deep' ? '🎯 Deep Focus' : '🔀 Mixed'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div key="3" initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -30, opacity: 0 }}>
                            <h2 style={{ fontFamily: 'Outfit', fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>📅 Exam Dates</h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '14px' }}>Optional — helps AI prioritize your schedule</p>
                            {form.exams.map((exam, i) => (
                                <div key={i} className="flex gap-2 mb-2">
                                    <select className="input-field" value={exam.subject} onChange={e => setForm(f => { const ex = [...f.exams]; ex[i].subject = e.target.value; return { ...f, exams: ex }; })}>
                                        <option value="">Select Subject</option>
                                        {form.subjects.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                    <input type="date" className="input-field" value={exam.date} onChange={e => setForm(f => { const ex = [...f.exams]; ex[i].date = e.target.value; return { ...f, exams: ex }; })} />
                                    <button onClick={() => setForm(f => ({ ...f, exams: f.exams.filter((_, j) => j !== i) }))} style={{ color: 'var(--danger)', padding: '8px' }}><Trash2 size={16} /></button>
                                </div>
                            ))}
                            <button onClick={addExam} className="btn-secondary w-full mt-2" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <Plus size={16} /> Add Exam Date
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex gap-3 mt-8">
                    {step > 1 && <button onClick={() => setStep(s => s - 1)} className="btn-secondary flex-1">Back</button>}
                    {step < 3
                        ? <button onClick={() => setStep(s => s + 1)} className="btn-primary flex-1">Continue <ArrowRight size={16} style={{ display: 'inline', marginLeft: '8px' }} /></button>
                        : <button onClick={handleFinish} className="btn-primary flex-1">🚀 Start Planning</button>
                    }
                </div>
            </motion.div>
        </motion.div>
    );
}

export default function Landing() {
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    const handleStart = () => {
        const user = storage.get('user', {});
        if (user?.name) { navigate('/dashboard'); return; }
        setShowModal(true);
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)', overflow: 'hidden' }}>
            {/* Animated background blobs */}
            <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
                <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 70%)' }} />
                <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,217,192,0.08) 0%, transparent 70%)' }} />
            </div>

            {/* Hero */}
            <section style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto', padding: '80px 24px 40px' }}>
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <div className="tag" style={{ display: 'inline-flex', marginBottom: '24px' }}>
                        <Zap size={14} /> AI-Powered Study Planning
                    </div>
                    <h1 style={{ fontFamily: 'Outfit', fontSize: 'clamp(40px,6vw,72px)', fontWeight: 800, lineHeight: 1.1, marginBottom: '20px' }}>
                        Study Smarter,<br /><span className="gradient-text">Stay Consistent</span>
                    </h1>
                    <p style={{ fontSize: '18px', color: 'var(--text-muted)', maxWidth: '560px', margin: '0 auto 40px', lineHeight: 1.6 }}>
                        AI builds your perfect study schedule. You just show up. Track streaks, monitor progress, and crush your exams.
                    </p>
                    <div className="flex gap-4 justify-center flex-wrap">
                        <motion.button onClick={handleStart} className="btn-primary" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                            style={{ padding: '14px 36px', fontSize: '16px', display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                            Start Planning Free <ArrowRight size={18} />
                        </motion.button>
                        <motion.button onClick={() => navigate('/dashboard')} className="btn-secondary" whileHover={{ scale: 1.03 }}>
                            View Dashboard
                        </motion.button>
                    </div>
                </motion.div>

                {/* Stats bar */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="glass flex flex-wrap justify-center gap-8 py-6 px-8 mb-20" style={{ borderRadius: '20px' }}>
                    {[['📚', 'Multiple Subjects', 'Manage all at once'], ['🔥', 'Streak Tracking', 'Build daily habits'], ['🤖', 'AI Generated', 'Smart scheduling'], ['📊', 'Progress Charts', 'Visual insights']].map(([icon, title, sub]) => (
                        <div key={title} style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '28px', marginBottom: '6px' }}>{icon}</div>
                            <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '15px' }}>{title}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{sub}</div>
                        </div>
                    ))}
                </motion.div>

                {/* Features */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                    <h2 style={{ fontFamily: 'Outfit', fontSize: '36px', fontWeight: 700, textAlign: 'center', marginBottom: '48px' }}>
                        Everything you need to <span className="gradient-text">stay on track</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
                        {FEATURES.map((f, i) => (
                            <motion.div key={f.title} className="glass glass-hover p-6" initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + i * 0.1 }}>
                                <div style={{ fontSize: '40px', marginBottom: '16px' }}>{f.icon}</div>
                                <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '18px', marginBottom: '8px' }}>{f.title}</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 }}>{f.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* How it works */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
                    <h2 style={{ fontFamily: 'Outfit', fontSize: '36px', fontWeight: 700, textAlign: 'center', marginBottom: '48px' }}>How it works</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
                        {STEPS.map((s, i) => (
                            <div key={s.num} style={{ textAlign: 'center', position: 'relative' }}>
                                <div style={{ width: '56px', height: '56px', borderRadius: '999px', background: 'linear-gradient(135deg, var(--primary), #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontFamily: 'Outfit', fontWeight: 800, fontSize: '18px', color: 'white' }}>{s.num}</div>
                                <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '18px', marginBottom: '8px' }}>{s.title}</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* CTA */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}
                    className="glass p-12 text-center mb-20" style={{ borderRadius: '24px', background: 'linear-gradient(135deg, rgba(108,99,255,0.15), rgba(0,217,192,0.08))' }}>
                    <h2 style={{ fontFamily: 'Outfit', fontSize: '36px', fontWeight: 800, marginBottom: '16px' }}>Ready to build your streak? 🔥</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Join thousands of students who turned consistency into a superpower.</p>
                    <motion.button onClick={handleStart} className="btn-primary" whileHover={{ scale: 1.05 }} style={{ padding: '14px 40px', fontSize: '16px' }}>
                        Get Started Now — It's Free
                    </motion.button>
                </motion.div>
            </section>

            <AnimatePresence>
                {showModal && <OnboardingModal onClose={() => setShowModal(false)} />}
            </AnimatePresence>
        </div>
    );
}
