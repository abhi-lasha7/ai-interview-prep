import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import InterviewSetupPage from './pages/InterviewSetupPage';
import InterviewRoomPage from './pages/InterviewRoomPage';
import ResultsPage from './pages/ResultsPage';
import InterviewReplayPage from './pages/InterviewReplayPage';
import WeakAreasPage from './pages/WeakAreasPage';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  const { fetchMe, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) fetchMe();
  }, []);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1a2e',
            color: '#e2e8f0',
            border: '1px solid rgba(255,255,255,0.1)'
          }
        }}
      />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/replay/:interviewId" element={<InterviewReplayPage />} />
        <Route path="/weak-areas" element={<WeakAreasPage />} />
        <Route path="/dashboard" element={
          <ProtectedRoute><DashboardPage /></ProtectedRoute>
        } />
        <Route path="/setup" element={
          <ProtectedRoute><InterviewSetupPage /></ProtectedRoute>
        } />
        <Route path="/interview" element={
          <ProtectedRoute><InterviewRoomPage /></ProtectedRoute>
        } />
        <Route path="/results" element={
          <ProtectedRoute><ResultsPage /></ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;