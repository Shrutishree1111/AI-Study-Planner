import { useState, useEffect } from 'react';
import { calculateStreaks, getCompletedDates } from '../lib/streaks.js';
import { storage } from '../lib/storage.js';

export const useStreak = () => {
    const [streaks, setStreaks] = useState({ current: 0, longest: 0 });

    const refresh = () => {
        const s = calculateStreaks();
        setStreaks(s);
        storage.set('streaks', { ...s, history: getCompletedDates() });
    };

    useEffect(() => { refresh(); }, []);

    return { ...streaks, refresh };
};
