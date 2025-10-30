import React, { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { logger } from '@/utils/logger';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar';
import {
  Home,
  Users,
  DollarSign,
  Settings,
  LogOut,
  TrendingUp,
  CheckSquare,
  Bot,
  Calendar,
  PieChart,
  Flag,
  CreditCard
} from 'lucide-react';

// Static navigation items - moved outside component to prevent recreation on every render
const NAVIGATION_ITEMS = [
  { title: 'Dashboard', icon: Home, path: '/' },
  { title: 'Analytics', icon: PieChart, path: '/analytics' },
  { title: 'Sub Tracker', icon: Users, path: '/subs' },
  { title: 'Red Flags', icon: Flag, path: '/redflags' },
  { title: 'Tributes', icon: DollarSign, path: '/tributes' },
  { title: 'AI Assistant', icon: Bot, path: '/chat-assistant' },
  { title: 'Checklist', icon: CheckSquare, path: '/checklist' },
  { title: 'Content Calendar', icon: Calendar, path: '/calendar' },
  { title: 'Pricing', icon: CreditCard, path: '/pricing' },
  { title: 'Settings', icon: Settings, path: '/settings' },
] as const;

interface AppSidebarProps {
  className?: string;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({ className }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  // Memoize callbacks to prevent unnecessary re-renders
  const handleNavigation = useCallback((path: string) => {
    navigate(path);
  }, [navigate]);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      logger.error('Sign out error:', error);
    }
  }, [signOut, navigate]);

  return (
    <Sidebar className={className}>
      <SidebarHeader className="p-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
              Findom Assistant
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {user?.email ? user.email.split('@')[0] : 'Guest'}
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-2">
        <SidebarMenu>
          {NAVIGATION_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton
                  isActive={isActive}
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full justify-start ${isActive ? 'bg-primary/10 text-primary' : ''}`}
                >
                  <item.icon className="w-4 h-4 mr-3" />
                  <span className="font-medium">{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-gray-200 dark:border-gray-700">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleSignOut}
              className="w-full justify-start text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <LogOut className="w-4 h-4 mr-3" />
              <span className="font-medium">Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};