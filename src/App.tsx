import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { FindomProvider } from "./context/FindomContext";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import DashboardPage from "./pages/DashboardPage";
import TwitterGeneratorPage from "./pages/TwitterGeneratorPage";
import RedditGeneratorPage from "./pages/RedditGeneratorPage";
import CaptionGeneratorPage from "./pages/CaptionGeneratorPage";
import ImageVisionPage from "./pages/ImageVisionPage";
import ResponseTemplatesPage from "./pages/ResponseTemplatesPage";
import SubTrackerPage from "./pages/SubTrackerPage";
import TaskGeneratorPage from "./pages/TaskGeneratorPage";
import PricingPage from "./pages/PricingPage";
import SettingsPage from "./pages/SettingsPage";
import ChecklistPage from "./pages/ChecklistPage";
import TributeTrackerPage from "./pages/TributeTrackerPage";
import ChatAssistantPage from "./pages/ChatAssistantPage";
import NotFound from "./pages/NotFound";
import { useAuth } from "./context/AuthContext";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }
  
  if (!user) {
    return <LoginPage />;
  }
  
  return <>{children}</>;
};

const AppContent = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route path="/*" element={
        <ProtectedRoute>
          <Layout>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/twitter" element={<TwitterGeneratorPage />} />
              <Route path="/reddit" element={<RedditGeneratorPage />} />
              <Route path="/caption" element={<CaptionGeneratorPage />} />
              <Route path="/image-vision" element={<ImageVisionPage />} />
              <Route path="/responses" element={<ResponseTemplatesPage />} />
              <Route path="/subs" element={<SubTrackerPage />} />
              <Route path="/tributes" element={<TributeTrackerPage />} />
              <Route path="/tasks" element={<TaskGeneratorPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/checklist" element={<ChecklistPage />} />
              <Route path="/chat-assistant" element={<ChatAssistantPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </ProtectedRoute>
      } />
    </Routes>
  </BrowserRouter>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <FindomProvider>
          <AppContent />
        </FindomProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;