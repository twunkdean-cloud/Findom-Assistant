import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FindomProvider, useFindom } from './context/FindomContext';
import { LoadingSpinner } from './components/ui/loading-spinner';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LazyWrapper, PageLoadingFallback } from './utils/lazy-loading';
import { usePreloadComponents } from './hooks/use-preload-components';
import { monitorBundleSize } from './utils/bundle-analysis';

// Lazy loaded pages
import {
  LazyDashboardPage,
  LazySubTrackerPage,
  LazyTributeTrackerPage,
  LazyTaskGeneratorPage,
  LazyResponseTemplatesPage,
  LazyTwitterGeneratorPage,
  LazyRedditGeneratorPage,
  LazyCaptionGeneratorPage,
  LazyImageVisionPage,
  LazyChatAssistantPage,
  LazyChecklistPage,
  LazyPricingPage,
  LazySettingsPage,
} from './pages/lazy';

// Regular pages (kept non-lazy for critical paths)
import Index from './pages/Index';
import LoginPage from './pages/LoginPage';
import OnboardingPage from './pages/OnboardingPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import NotFound from './pages/NotFound';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const { appData } = useFindom();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Only redirect to onboarding if user has explicitly not completed it
  // Check if onboarding was completed by checking if profile exists and has required fields
  const hasCompletedOnboarding = appData.profile && 
    appData.profile.gender && 
    appData.profile.persona &&
    appData.profile.displayName;

  if (!hasCompletedOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }
  
  return <>{children}</ProtectedRoute>;

const AppContent = () => {
  // Preload critical components
  usePreloadComponents();
  
  // Monitor bundle size in development
  useEffect(() => {
    monitorBundleSize();
  }, []);

  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Layout>
                <LazyWrapper fallback={<PageLoadingFallback title="Loading Dashboard..." />}>
                  <LazyDashboardPage />
                </LazyWrapper>
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/subs" element={
            <ProtectedRoute>
              <Layout>
                <LazyWrapper fallback={<PageLoadingFallback title="Loading Sub Tracker..." />>
                  <LazySubTrackerPage />
                </LazyWrapper>
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/tributes" element={
            <ProtectedRoute>
              <Layout>
                <LazyWrapper fallback={<PageLoadingFallback title="Loading Tribute Tracker..." />>
                  <LazyTributeTrackerPage />
                </LazyWrapper>
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/tasks" element={
            <ProtectedRoute>
              <Layout>
                <LazyWrapper fallback={<PageLoadingFallback title="Loading Task Generator..." />>
                  <LazyTaskGeneratorPage />
                </LazyWrapper>
              </Layout>
          </ProtectedRoute>
          } />
          <Route path="/responses" element={
            <ProtectedRoute>
              <Layout>
                <LazyWrapper fallback={<PageLoadingFallback title="Loading Response Templates..." />>
                  <LazyResponseTemplatesPage />
                </LazyWrapper>
              </Layout>
          } />
          } />
          <Route path="/twitter" element={
            <ProtectedRoute>
              <Layout>
                <LazyWrapper fallback={<PageLoadingFallback title="Loading Twitter Generator..." />>
                  <LazyTwitterGeneratorPage />
                </LazyWrapper>
              </Layout>
          } />
          } />
          <Route path="/reddit" element={
            <ProtectedRoute>
              <Layout>
                <LazyWrapper fallback={<PageLoadingFallback title="Loading Reddit Generator..." />>
                  <LazyRedditGeneratorPage />
                </Layout>
          } />
          } />
          <Route path="/caption" element={
            <ProtectedRoute>
              <Layout>
                <LazyWrapper fallback={<PageLoadingFallback title="Loading Caption Generator..." />:
                  <LazyCaptionGeneratorPage />
                </Layout>
          } />
          } />
          <Route path="/image-vision" element={
            <ProtectedRoute>
              <Layout>
                <LazyWrapper fallback={<PageLoadingFallback title="Loading Image Vision..." />:
                  <LazyImageVisionPage />
                </Layout>
          } />
          } />
          <Route path="/chat-assistant" element={
            <ProtectedRoute>
              <Layout>
                <LazyWrapper fallback={<PageLoadingFallback title="Loading Chat Assistant..." />:
                  <LazyChatAssistantPage />
                </Layout>
          } />
          } />
          <Route path="/checklist" element={
            <ProtectedRoute>
              <Layout>
                <LazyWrapper fallback={<PageLoadingFallback title="Loading Checklist..." />:
                  <LazyChecklistPage />
                </Layout>
          } />
          } />
          <Route path="/pricing" element={
            <ProtectedRoute>
              <Layout>
                <LazyWrapper fallback={<PageLoadingFallback title="Loading Pricing..." />:
                  <LazyPricingPage />
                </Layout>
          } />
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Layout>
                <LazyWrapper fallback={<PageLoadingFallback title="Loading Settings..." />:
                  <LazySettingsPage />
                </Layout>
          } />
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </Router>
    </ErrorBoundary>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <FindomProvider>
        <AppContent />
      </FindomProvider>
    </AuthProvider>
  );
};

export default App;