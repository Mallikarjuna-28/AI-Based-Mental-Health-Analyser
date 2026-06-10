import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';

// Page Imports
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { Dashboard } from './pages/Dashboard';
import { FacialAnalysis } from './pages/FacialAnalysis';
import { VoiceAnalysis } from './pages/VoiceAnalysis';
import { TextAnalysis } from './pages/TextAnalysis';
import { Questionnaire } from './pages/Questionnaire';
import { Chatbot } from './pages/Chatbot';
import { Analytics } from './pages/Analytics';
import { FinalReport } from './pages/FinalReport';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';

const DashboardLayout = ({ children, title }) => {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Topbar title={title} />
        <div style={{ flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const location = useLocation();
  const currentPath = location.pathname;

  // Pages that do NOT show sidebar/topbar
  const isOuterPage = currentPath === '/' || currentPath === '/login';

  return (
    <AuthProvider>
      {isOuterPage ? (
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      ) : (
        <Routes>
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout title="Overview Dashboard">
                <Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/facial-analysis" element={
            <ProtectedRoute>
              <DashboardLayout title="Facial Emotion Detection">
                <FacialAnalysis />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/voice-analysis" element={
            <ProtectedRoute>
              <DashboardLayout title="Voice Emotion Analysis">
                <VoiceAnalysis />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/text-analysis" element={
            <ProtectedRoute>
              <DashboardLayout title="Text Sentiment Analysis">
                <TextAnalysis />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/questionnaire" element={
            <ProtectedRoute>
              <DashboardLayout title="Psychological Assessment">
                <Questionnaire />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/chatbot" element={
            <ProtectedRoute>
              <DashboardLayout title="AI Wellness Chatbot">
                <Chatbot />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute>
              <DashboardLayout title="Trends & Mood Analytics">
                <Analytics />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/final-report" element={
            <ProtectedRoute>
              <DashboardLayout title="Wellness Fusion Report">
                <FinalReport />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <DashboardLayout title="Profile Settings">
                <Profile />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <DashboardLayout title="Portal Preferences">
                <Settings />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          {/* Catch all redirect to dashboard */}
          <Route path="*" element={
            <ProtectedRoute>
              <DashboardLayout title="Overview Dashboard">
                <Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          } />
        </Routes>
      )}
    </AuthProvider>
  );
}
