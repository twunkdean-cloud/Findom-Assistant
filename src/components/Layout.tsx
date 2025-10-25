import React from 'react';
import { Outlet } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary';
import { useAuth } from '@/context/AuthContext';
import { useMobile } from '@/hooks/use-mobile';
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Users, 
  DollarSign, 
  Calendar, 
  Settings, 
  Brain, 
  MessageSquare,
  Image,
  FileText,
  CheckSquare,
  Target,
  TrendingUp
} from 'lucide-react';

const Layout: React.FC = () => {
  const { user, loading } = useAuth();
  const { isMobile } = useMobile();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400"></div>
      </div>
    );
  }

  if (!user) {
    return <Outlet />;
  }

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Sub Tracker', href: '/subs', icon: Users },
    { name: 'Tribute Tracker', href: '/tributes', icon: DollarSign },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
    { name: 'Checklist', href: '/checklist', icon: CheckSquare },
    { name: 'AI Assistant', href: '/chat', icon: MessageSquare },
    { name: 'Content Generator', href: '/content', icon: FileText },
    { name: 'Image Vision', href: '/vision', icon: Image },
    { name: 'Analytics', href: '/analytics', icon: TrendingUp },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <ErrorBoundary>
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <div className="p-4">
              <h2 className="text-lg font-semibold text-gray-100">Findom Assistant</h2>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild>
                    <a href={item.href} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <div className="p-4">
              <div className="text-sm text-gray-400">
                {user.email}
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-700 bg-gray-800 px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex flex-1 items-center justify-between">
              <h1 className="text-lg font-semibold text-gray-100">Findom Assistant</h1>
              {isMobile && (
                <Button variant="ghost" size="sm">
                  Menu
                </Button>
              )}
            </div>
          </header>
          <main className="flex-1 bg-gray-900">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </ErrorBoundary>
  );
};

export default Layout;