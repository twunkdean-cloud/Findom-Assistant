import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
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
  MessageSquare, 
  FileText, 
  Settings, 
  LogOut,
  TrendingUp,
  CheckSquare,
  Image,
  Twitter,
  MessageCircle,
  CreditCard,
  Bot,
  Calendar
} from 'lucide-react';

const navigationItems = [
  { title: 'Dashboard', icon: Home, path: '/' },
  { title: 'Sub Tracker', icon: Users, path: '/subs' },
  { title: 'Tributes', icon: DollarSign, path: '/tributes' },
  { title: 'AI Assistant', icon: Bot, path: '/chat-assistant' },
  { title: 'Checklist', icon: CheckSquare, path: '/checklist' },
  { title: 'Content Calendar', icon: Calendar, path: '/calendar' },
  { title: 'Pricing', icon: CreditCard, path: '/pricing' },
  { title: 'Settings', icon: Settings, path: '/settings' },
];

const aiTools = [
  { title: 'Twitter', icon: Twitter, path: '/twitter' },
  { title: 'Reddit', icon: MessageCircle, path: '/reddit' },
  { title: 'Captions', icon: FileText, path: '/caption' },
  { title: 'Image Vision', icon: Image, path: '/image-vision' },
  { title: 'Responses', icon: MessageSquare, path: '/responses' },
  { title: 'Tasks', icon: CheckSquare, path: '/tasks' },
];

interface AppSidebarProps {
  className?: string;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({ className }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

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
          {navigationItems.map((item) => {
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