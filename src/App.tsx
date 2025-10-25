import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { FindomProvider } from '@/context/FindomContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Layout } from '@/components/Layout';
import { Toaster } from '@/components/ui/sonner';
import { ComponentLoadingFallback } from '@/utils/lazy-loading';

// Lazy loaded pages
import {
  LazyIndex,
  LazyLoginPage,
  LazyAuthCallbackPage,
  LazyOnboardingPage,
  LazySubTrackerPage,
  LazyTributeTrackerPage,
  LazyChatAssistantPage,
  LazyCaptionGeneratorPage,
  LazyTaskGeneratorPage,
  LazyResponseTemplatesPage,
  LazyTwitterGeneratorPage,
  LazyRedditGeneratorPage,
  LazyImageVisionPage,
  LazyChecklistPage,
  LazyCalendarPage,
  LazyPricingPage,
  LazySettingsPage,
  LazyNotFound
} from '@/pages/lazy';

const AppRoutes: React.FC = () => {
  const { user, loading, profile } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Suspense fallback={<ComponentLoadingFallback />}><LazyLoginPage /></Suspense>} />
        <Route path="/auth/callback" element={<Suspense fallback={<ComponentLoadingFallback />}><LazyAuthCallbackPage /></Suspense>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  if (profile && !profile.onboarding_completed) {
    return (
      <Routes>
        <Route path="/onboarding" element={<Suspense fallback={<ComponentLoadingFallback />}><LazyOnboardingPage /></Suspense>} />
        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Suspense fallback={<ComponentLoadingFallback />}>
        <Routes>
          <Route path="/" element={<LazyIndex />} />
          <Route path="/subs" element={<LazySubTrackerPage />} />
          <Route path="/tributes" element={<LazyTributeTrackerPage />} />
          <Route path="/chat-assistant" element={<LazyChatAssistantPage />} />
          <Route path="/caption" element={<LazyCaptionGeneratorPage />} />
          <Route path="/tasks" element={<LazyTaskGeneratorPage />} />
          <Route path="/responses" element={<LazyResponseTemplatesPage />} />
          <Route path="/twitter" element={<LazyTwitterGeneratorPage />} />
          <Route path="/reddit" element={<LazyRedditGeneratorPage />} />
          <Route path="/image-vision" element={<LazyImageVisionPage />} />
          <Route path="/checklist" element={<LazyChecklistPage />} />
          <Route path="/calendar" element={<LazyCalendarPage />} />
          <Route path="/pricing" element={<LazyPricingPage />} />
          <Route path="/settings" element={<LazySettingsPage />} />
          <Route path="*" element={<LazyNotFound />} />
        </Routes>
      </Suspense>
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <FindomProvider>
            <AppRoutes />
            <Toaster />
          </FindomProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
};

export default App;