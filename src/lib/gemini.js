// Gemini API client
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export const callGemini = async (prompt, apiKey) => {
    const key = apiKey || import.meta.env.VITE_GEMINI_API_KEY;
    if (!key) throw new Error('No Gemini API key provided');

    const res = await fetch(`${GEMINI_URL}?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 4096 }
        })
    });
    if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
};

export const generateSchedulePrompt = (user) => {
    const { subjects, dailyGoal, studyStyle, exams } = user;
    return `You are a professional study planner. Create a personalized 7-day study schedule.

Student Profile:
- Subjects: ${subjects.join(', ')}
- Daily study goal: ${dailyGoal} hours
- Study style: ${studyStyle} (${studyStyle === 'pomodoro' ? '25 min sessions, 5 min breaks' : studyStyle === 'deep' ? '90 min deep focus blocks' : '50 min sessions, 10 min breaks'})
- Upcoming exams: ${exams.length ? exams.map(e => `${e.subject} on ${e.date}`).join(', ') : 'None specified'}

Instructions:
- Prioritize subjects with closer exam dates
- Distribute subjects evenly but weight by exam proximity
- Include specific topics (not just "study Math" — say "Algebra: Quadratic Equations")
- Vary the topics across days
- Fit sessions within the daily hour goal

Return ONLY valid JSON in this exact format (no markdown, no backticks, no explanation):
{
  "week": [
    {
      "day": "Monday",
      "date": "",
      "slots": [
        {
          "id": "unique-id",
          "time": "09:00 - 10:30",
          "subject": "Math",
          "topic": "Algebra: Quadratic Equations",
          "duration": 90,
          "type": "study"
        }
      ]
    }
  ]
}`;
};

export const generateDailyTip = async (subjects, apiKey) => {
    const key = apiKey || import.meta.env.VITE_GEMINI_API_KEY;
    if (!key) return getRandomTip();
    try {
        const prompt = `Give one short, specific, actionable study tip for a student studying ${subjects.slice(0, 3).join(', ')}. Maximum 2 sentences. Be encouraging and practical. No preamble.`;
        return await callGemini(prompt, key);
    } catch { return getRandomTip(); }
};

const TIPS = [
    "Use active recall: close your notes and try to write down everything you remember. This is 3x more effective than re-reading.",
    "Study in 25-minute focused blocks with 5-minute breaks. Your brain consolidates memory during rest.",
    "Teach what you just learned to an imaginary student. If you can explain it simply, you understand it deeply.",
    "Start your session with the hardest topic when your energy is highest. Save easier reviews for later.",
    "Space your reviews — revisit yesterday's material for 5 minutes before starting today's new content.",
    "Write practice questions as you study. Testing yourself is twice as effective as highlighting.",
];
const getRandomTip = () => TIPS[Math.floor(Math.random() * TIPS.length)];
