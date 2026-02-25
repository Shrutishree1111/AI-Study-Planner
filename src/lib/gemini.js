// Gemini API client
// Switching to 1.5-Flash for better stability and lower latency
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

/**
 * Robust JSON cleaner for AI responses
 * Strips markdown code blocks and whitespace
 */
const cleanJsonResponse = (text) => {
  try {
    // Remove markdown code blocks if present
    let cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    // Take everything from the first '{' to the last '}'
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }
    return JSON.parse(cleaned);
  } catch (e) {
    console.error('Failed to parse AI JSON:', e, 'Raw text:', text);
    return null;
  }
};

export const callGemini = async (prompt, apiKey) => {
  const key = apiKey || import.meta.env.VITE_GEMINI_API_KEY;
  if (!key) throw new Error('No Gemini API key provided');

  try {
    const res = await fetch(`${GEMINI_URL}?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4096,
          response_mime_type: "application/json" // Hint for JSON output (if supported)
        }
      })
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(`Gemini API error ${res.status}: ${errorData?.error?.message || res.statusText}`);
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // If the prompt asked for JSON, try to clean and parse it
    if (prompt.toLowerCase().includes('return only valid json')) {
      return cleanJsonResponse(text);
    }

    return text;
  } catch (error) {
    console.error('Gemini API Call Failed:', error);
    throw error;
  }
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
- For each day, include 2-4 slots that fit within the ${dailyGoal} hour limit.
- Vary the topics to prevent burnout.

Return ONLY valid JSON in this exact structure:
{
  "week": [
    {
      "day": "Monday",
      "date": "2024-05-20",
      "slots": [
        {
          "id": "unique_id_1",
          "time": "09:00 - 10:00",
          "subject": "Math",
          "topic": "Algebra",
          "duration": 60,
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
    const prompt = `Give one short, specific, actionable study tip for a student studying ${subjects.slice(0, 3).join(', ')}. Maximum 2 sentences. No preamble.`;
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
