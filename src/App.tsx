import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { FindomProvider } from '@/context/FindomContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Layout } from '@/components/Layout';
import { Toaster } from '@/components/ui/sonner';
import { useAuth } from '@/context/AuthContext';
import { ComponentLoadingFallback } from '@/utils/lazy-loading';

// Lazy loaded pages
import {
  LazyIndex,
  LazyLoginPage,
  LazyAuthCallbackPage,
  LazyOnboardingPage,
  LazyDashboardPage,
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
  LazyPricingPage,
  LazySettingsPage,
  LazyNotFound
} from '@/pages/lazy';

// Preload critical components
const preloadCriticalComponents = () => {
  import('@/pages/Index');
  import('@/pages/DashboardPage');
  import('@/pages/LoginPage');
};

const AppRoutes: React.FC = () => {
  const { user, loading } = useAuth();

  React.useEffect(() => {
    // Preload critical components after initial render
    const timer = setTimeout(preloadCriticalComponents, 1000);
    return () => clearTimeout(timer);
  }, []);

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
        <Route 
          path="/login" 
          element={
            <Suspense fallback={<ComponentLoadingFallback />}>
              <LazyLoginPage />
            </Suspense>
          } 
        />
        <Route 
          path="/auth/callback" 
          element={
            <Suspense fallback={<ComponentLoadingFallback />}>
              <LazyAuthCallbackPage />
            </Suspense>
          } 
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route 
          path="/" 
          element={
            <Suspense fallback={<ComponentLoadingFallback />}>
              <LazyIndex />
            </Suspense>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <Suspense fallback={<ComponentLoadingFallback />}>
              <LazyDashboardPage />
            </Suspense>
          } 
        />
        <Route 
          path="/onboarding" 
          element={
            <Suspense fallback={<ComponentLoadingFallback />}>
              <LazyOnboardingPage />
            </Suspense>
          } 
        />
        <Route 
          path="/subs" 
          element={
            <Suspense fallback={<ComponentLoadingFallback />}>
              <LazySubTrackerPage />
            </Suspense>
          } 
        />
        <Route 
          path="/tributes" 
          element={
            <Suspense fallback={<ComponentLoadingFallback />}>
              <LazyTributeTrackerPage />
            </Suspense>
          } 
        />
        <Route 
          path="/chat" 
          element={
            <Suspense fallback={<ComponentLoadingFallback />}>
              <LazyChatAssistantPage />
            </Suspense>
          } 
        />
        <Route 
          path="/captions" 
          element={
            <Suspense fallback={<ComponentLoadingFallback />}>
              <LazyCaptionGeneratorPage />
            </Suspense>
          } 
        />
        <Route 
          path="/tasks" 
          element={
            <Suspense fallback={<ComponentLoadingFallback />}>
              <LazyTaskGeneratorPage />
            </Suspense>
          } 
        />
        <Route 
          path="/templates" 
          element={
            <Suspense fallback={<ComponentLoadingFallback />}>
              <LazyResponseTemplatesPage />
            </Suspense>
          } 
        />
        <Route 
          path="/twitter" 
          element={
            <Suspense fallback={<ComponentLoadingFallback />}>
              <LazyTwitterGeneratorPage />
            </Suspense>
          } 
        />
        <Route 
          path="/reddit" 
          element={
            <Suspense fallback={<ComponentLoadingFallback />}>
              <LazyRedditGeneratorPage />
            </Suspense>
          } 
        />
        <Route 
          path="/vision" 
          element={
            <Suspense fallback={<ComponentLoadingFallback />}>
              <LazyImageVisionPage />
            </Suspense>
          } 
        />
        <Route 
          path="/checklists" 
          element={
            <Suspense fallback={<ComponentLoadingFallback />}>
              <LazyChecklistPage />
            </Suspense>
          } 
        />
        <Route 
          path="/pricing" 
          element={
            <Suspense fallback={<ComponentLoadingFallback />}>
              <LazyPricingPage />
            </Suspense>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <Suspense fallback={<ComponentLoadingFallback />}>
              <LazySettingsPage />
            </Suspense>
          } 
        />
        <Route 
          path="*" 
          element={
            <Suspense fallback={<ComponentLoadingFallback />}>
              <LazyNotFound />
            </Suspense>
          } 
        />
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