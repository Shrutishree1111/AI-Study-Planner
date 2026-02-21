// localStorage helpers
const PREFIX = 'ai_study_';

export const storage = {
    get: (key, fallback = null) => {
        try {
            const val = localStorage.getItem(PREFIX + key);
            return val ? JSON.parse(val) : fallback;
        } catch { return fallback; }
    },
    set: (key, value) => {
        try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); }
        catch (e) { console.error('Storage error:', e); }
    },
    remove: (key) => localStorage.removeItem(PREFIX + key),
    clear: () => {
        Object.keys(localStorage)
            .filter(k => k.startsWith(PREFIX))
            .forEach(k => localStorage.removeItem(k));
    }
};

export const defaultUser = {
    name: '',
    subjects: [],
    dailyGoal: 4,
    studyStyle: 'pomodoro',
    exams: []
};

export const defaultSettings = {
    darkMode: true,
    notifications: true,
    geminiKey: ''
};

export const initStorage = () => {
    if (!storage.get('user')) storage.set('user', defaultUser);
    if (!storage.get('sessions')) storage.set('sessions', []);
    if (!storage.get('streaks')) storage.set('streaks', { current: 0, longest: 0, history: [] });
    if (!storage.get('reminders')) storage.set('reminders', []);
    if (!storage.get('settings')) storage.set('settings', defaultSettings);
};
