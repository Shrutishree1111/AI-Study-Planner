import { storage } from './storage.js';
import { format, isToday, parseISO, differenceInCalendarDays } from 'date-fns';

export const getSessionsForDate = (date) => {
    const sessions = storage.get('sessions', []);
    const dateStr = format(date, 'yyyy-MM-dd');
    return sessions.filter(s => s.date === dateStr);
};

export const getCompletedDates = () => {
    const sessions = storage.get('sessions', []);
    const dates = [...new Set(
        sessions.filter(s => s.completed).map(s => s.date)
    )];
    return dates.sort();
};

export const calculateStreaks = () => {
    const completedDates = getCompletedDates();
    if (!completedDates.length) return { current: 0, longest: 0 };

    let current = 0;
    let longest = 0;
    let streak = 1;
    const today = format(new Date(), 'yyyy-MM-dd');
    const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');

    // Check if today or yesterday is in completed dates (to keep streak alive)
    const latestDate = completedDates[completedDates.length - 1];
    if (latestDate !== today && latestDate !== yesterday) {
        current = 0;
    } else {
        for (let i = completedDates.length - 1; i > 0; i--) {
            const diff = differenceInCalendarDays(
                parseISO(completedDates[i]),
                parseISO(completedDates[i - 1])
            );
            if (diff === 1) { streak++; }
            else { break; }
        }
        current = streak;
    }

    // Calculate longest streak
    let tempStreak = 1;
    for (let i = 1; i < completedDates.length; i++) {
        const diff = differenceInCalendarDays(
            parseISO(completedDates[i]),
            parseISO(completedDates[i - 1])
        );
        if (diff === 1) {
            tempStreak++;
            longest = Math.max(longest, tempStreak);
        } else {
            tempStreak = 1;
        }
    }
    longest = Math.max(longest, current, 1);

    return { current, longest };
};

export const logSession = (session) => {
    const sessions = storage.get('sessions', []);
    sessions.push({ ...session, date: format(new Date(), 'yyyy-MM-dd') });
    storage.set('sessions', sessions);
    const streaks = calculateStreaks();
    storage.set('streaks', { ...streaks, history: getCompletedDates() });
};

export const getTodayProgress = () => {
    const user = storage.get('user', {});
    const todaySessions = getSessionsForDate(new Date());
    const completedMinutes = todaySessions
        .filter(s => s.completed)
        .reduce((sum, s) => sum + (s.duration || 0), 0);
    const goalMinutes = (user.dailyGoal || 4) * 60;
    return { completedMinutes, goalMinutes, percent: Math.min(100, Math.round((completedMinutes / goalMinutes) * 100)) };
};

export const getHeatmapData = (days = 91) => {
    const sessions = storage.get('sessions', []);
    const map = {};
    sessions.filter(s => s.completed).forEach(s => {
        map[s.date] = (map[s.date] || 0) + (s.duration || 60);
    });
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400000);
        const key = format(d, 'yyyy-MM-dd');
        const minutes = map[key] || 0;
        result.push({ date: key, minutes, level: minutes === 0 ? 0 : minutes < 60 ? 1 : minutes < 120 ? 2 : minutes < 180 ? 3 : 4 });
    }
    return result;
};

export const getWeeklyData = () => {
    const sessions = storage.get('sessions', []);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result = days.map(name => ({ name, completed: 0, planned: 0 }));
    sessions.forEach(s => {
        const d = parseISO(s.date);
        const idx = d.getDay();
        result[idx].planned += s.duration || 60;
        if (s.completed) result[idx].completed += s.duration || 60;
    });
    return result.map(d => ({ ...d, completed: Math.round(d.completed / 60 * 10) / 10, planned: Math.round(d.planned / 60 * 10) / 10 }));
};
