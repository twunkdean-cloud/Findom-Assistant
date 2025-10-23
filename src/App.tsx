import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { FindomProvider } from '@/context/FindomContext';
import { Toaster } from '@/components/ui/sonner';
import Layout from '@/components/Layout';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import SubTrackerPage from '@/pages/SubTrackerPage';
import TributeTrackerPage from '@/pages/TributeTrackerPage';
import TaskGeneratorPage from '@/pages/TaskGeneratorPage';
import ResponseTemplatesPage from '@/pages/ResponseTemplatesPage';
import TwitterGeneratorPage from '@/pages/TwitterGeneratorPage';
import RedditGeneratorPage from '@/pages/RedditGeneratorPage';
import CaptionGeneratorPage from '@/pages/CaptionGeneratorPage';
import ImageVisionPage from '@/pages/ImageVisionPage';
import ChatAssistantPage from '@/pages/ChatAssistantPage';
import ChecklistPage from '@/pages/ChecklistPage';
import SettingsPage from '@/pages/SettingsPage';
import PricingPage from '@/pages/PricingPage';
import AuthCallbackPage from '@/pages/AuthCallbackPage';
import NotFound from '@/pages/NotFound';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
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
  
  return <>{children}</>;
};

const AuthNavigationHandler = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth navigation handler:', event, session?.user?.email);

        if (event === 'SIGNED_IN' && session) {
          // Only redirect if not on auth callback page
          if (!window.location.pathname.includes('/auth/callback')) {
            navigate('/', { replace: true });
          }
        } else if (event === 'SIGNED_OUT') {
          navigate('/login', { replace: true });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  return null;
};

const AppContent = () => {
  return (
    <Router>
      <AuthNavigationHandler />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Layout>
              <DashboardPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/subs" element={
          <ProtectedRoute>
            <Layout>
              <SubTrackerPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/tributes" element={
          <ProtectedRoute>
            <Layout>
              <TributeTrackerPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/tasks" element={
          <ProtectedRoute>
            <Layout>
              <TaskGeneratorPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/responses" element={
          <ProtectedRoute>
            <Layout>
              <ResponseTemplatesPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/twitter" element={
          <ProtectedRoute>
            <Layout>
              <TwitterGeneratorPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/reddit" element={
          <ProtectedRoute>
            <Layout>
              <RedditGeneratorPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/caption" element={
          <ProtectedRoute>
            <Layout>
              <CaptionGeneratorPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/image-vision" element={
          <ProtectedRoute>
            <Layout>
              <ImageVisionPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/chat-assistant" element={
          <ProtectedRoute>
            <Layout>
              <ChatAssistantPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/pricing" element={
          <ProtectedRoute>
            <Layout>
              <PricingPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/checklist" element={
          <ProtectedRoute>
            <Layout>
              <ChecklistPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <Layout>
              <SettingsPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </Router>
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