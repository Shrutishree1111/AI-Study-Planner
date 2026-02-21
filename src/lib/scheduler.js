// Rule-based fallback scheduler (no API needed)
import { format, addDays } from 'date-fns';

export const generateRuleBasedSchedule = (user) => {
    const { subjects = [], dailyGoal = 4, studyStyle = 'pomodoro', exams = [] } = user;
    if (!subjects.length) return null;

    // Sort subjects by exam proximity
    const today = new Date();
    const sortedSubjects = [...subjects].sort((a, b) => {
        const examA = exams.find(e => e.subject === a);
        const examB = exams.find(e => e.subject === b);
        if (!examA && !examB) return 0;
        if (!examA) return 1;
        if (!examB) return -1;
        return new Date(examA.date) - new Date(examB.date);
    });

    const sessionDuration = studyStyle === 'pomodoro' ? 25 : studyStyle === 'deep' ? 90 : 50;
    const breakDuration = studyStyle === 'pomodoro' ? 5 : 15;
    const startHour = 9;

    const week = [];
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    for (let d = 0; d < 7; d++) {
        const slots = [];
        const totalMinutes = dailyGoal * 60;
        let currentMinute = startHour * 60;
        let subjectIdx = 0;
        let minutesUsed = 0;

        while (minutesUsed < totalMinutes) {
            const subject = sortedSubjects[subjectIdx % sortedSubjects.length];
            const startH = Math.floor(currentMinute / 60);
            const startM = currentMinute % 60;
            const endMinute = currentMinute + sessionDuration;
            const endH = Math.floor(endMinute / 60);
            const endM = endMinute % 60;

            slots.push({
                id: `${d}-${slots.length}`,
                time: `${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')} - ${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`,
                subject,
                topic: `${subject} — Session ${Math.floor(minutesUsed / sessionDuration) + 1}`,
                duration: sessionDuration,
                type: 'study',
                completed: false
            });

            currentMinute += sessionDuration + breakDuration;
            minutesUsed += sessionDuration;
            subjectIdx++;
            if (minutesUsed + sessionDuration > totalMinutes) break;
        }

        week.push({ day: dayNames[d], date: format(addDays(today, d), 'yyyy-MM-dd'), slots });
    }

    return { generatedAt: today.toISOString(), source: 'rule-based', week };
};
