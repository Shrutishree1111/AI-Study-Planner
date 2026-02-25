# 🎓 StudyAI — AI Consistency Study Planner

StudyAI is a modern, AI-powered web application designed to help students build consistent study habits. It generates personalized 7-day schedules, tracks consistency via streaks and heatmaps, and provides a focused environment with a built-in Pomodoro timer.


## ✨ Key Features

- **🤖 AI Schedule Generator**: Creates tailored weekly study plans based on your subjects, daily goals, and exam proximity.
- **🔥 Consistency Tracking**: GitHub-style activity heatmaps and streak counters to keep you motivated.
- **⏱️ Focus Mode**: Integrated Pomodoro timer (25/5 min cycles) with session logging.
- **📊 Detailed Analytics**: Visual breakdown of study time by subject and progress against daily goals.
- **🔔 Smart Reminders**: Daily study sessions and browser notifications.
- **🛡️ Secure & Private**: All data is stored locally in your browser (`localStorage`). API keys are never stored on a server.

## 🛠️ Tech Stack

- **Frontend**: React 19 (Vite)
- **Styling**: Tailwind CSS v3 (Custom Glassmorphism Design)
- **Animations**: Framer Motion
- **AI**: Google Gemini 2.0 Flash API
- **Charts**: Recharts
- **Icons**: Lucide React
- **Date Management**: date-fns
- **Notifications**: React Hot Toast

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository or extract the project files.
2. Navigate to the project directory:
   ```bash
   cd "AI Study Planner"
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Configuration

The app requires a Google Gemini API key for AI features (Schedule Generation & AI Tips).

1. Copy the `.env.example` file to a new file named `.env`:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and replace `your_api_key_here` with your actual key from [Google AI Studio](https://aistudio.google.com/).
   ```env
   VITE_GEMINI_API_KEY=AIza...
   ```
3. Alternatively, you can enter the key within the **Settings** page of the running app.

### Running the App

Start the development server:
```bash
npm run dev
```
The app will be available at [http://localhost:5173](http://localhost:5173).

## 📂 Project Structure

- `src/components/`: Reusable UI and Layout components.
- `src/pages/`: Main page views (Dashboard, Schedule, Progress, etc.).
- `src/lib/`: Core logic (AI integration, streak calculations, storage helpers).
- `src/hooks/`: Custom React hooks for global state and sync.
- `src/index.css`: Design system tokens and global glassmorphism styles.

## 📄 License

This project is open-source and available for educational purposes.
