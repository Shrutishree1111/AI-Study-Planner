import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { initStorage } from './lib/storage.js';
import AppLayout from './components/layout/AppLayout.jsx';
import Landing from './pages/Landing.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Schedule from './pages/Schedule.jsx';
import Planner from './pages/Planner.jsx';
import Progress from './pages/Progress.jsx';
import Reminders from './pages/Reminders.jsx';
import Settings from './pages/Settings.jsx';

function App() {
  useEffect(() => { initStorage(); }, []);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#1A1A2E', color: '#F0F0FF', border: '1px solid rgba(108,99,255,0.3)', borderRadius: '12px' },
          success: { iconTheme: { primary: '#00D9C0', secondary: '#0A0A18' } },
          error: { iconTheme: { primary: '#FF6B6B', secondary: '#0A0A18' } },
        }}
      />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/reminders" element={<Reminders />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
