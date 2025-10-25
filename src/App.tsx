import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { FindomProvider } from '@/context/FindomContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Layout } from '@/components/Layout';
import { Toaster } from '@/components/ui/sonner';
import { useAuth } from '@/context/AuthContext';

// Pages
import Index from '@/pages/Index';
import LoginPage from '@/pages/LoginPage';
import AuthCallbackPage from '@/pages/AuthCallbackPage';
import OnboardingPage from '@/pages/OnboardingPage';
import DashboardPage from '@/pages/DashboardPage';
import SubTrackerPage from '@/pages/SubTrackerPage';
import TributeTrackerPage from '@/pages/TributeTrackerPage';
import ChatAssistantPage from '@/pages/ChatAssistantPage';
import CaptionGeneratorPage from '@/pages/CaptionGeneratorPage';
import TaskGeneratorPage from '@/pages/TaskGeneratorPage';
import ResponseTemplatesPage from '@/pages/ResponseTemplatesPage';
import TwitterGeneratorPage from '@/pages/TwitterGeneratorPage';
import RedditGeneratorPage from '@/pages/RedditGeneratorPage';
import ImageVisionPage from '@/pages/ImageVisionPage';
import ChecklistPage from '@/pages/ChecklistPage';
import PricingPage from '@/pages/PricingPage';
import SettingsPage from '@/pages/SettingsPage';
import NotFound from '@/pages/NotFound';

const AppRoutes: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/subs" element={<SubTrackerPage />} />
        <Route path="/tributes" element={<TributeTrackerPage />} />
        <Route path="/chat" element={<ChatAssistantPage />} />
        <Route path="/captions" element={<CaptionGeneratorPage />} />
        <Route path="/tasks" element={<TaskGeneratorPage />} />
        <Route path="/templates" element={<ResponseTemplatesPage />} />
        <Route path="/twitter" element={<TwitterGeneratorPage />} />
        <Route path="/reddit" element={<RedditGeneratorPage />} />
        <Route path="/vision" element={<ImageVisionPage />} />
        <Route path="/checklists" element={<ChecklistPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <FindomProvider>
          <Router>
            <AppRoutes />
            <Toaster />
          </Router>
        </FindomProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;