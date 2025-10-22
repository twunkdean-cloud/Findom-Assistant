import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
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
import { AuthProvider } from "./context/AuthContext";
import { FindomProvider } from "./context/FindomContext";

const queryClient = new QueryClient();

const App = () => (
  <AuthProvider>
    <FindomProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
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
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </FindomProvider>
  </AuthProvider>
);

export default App;