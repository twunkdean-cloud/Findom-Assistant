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
  Calendar, 
  Settings, 
  LogOut,
  TrendingUp,
  CheckSquare,
  Image,
  Twitter,
  MessageCircle,
  CreditCard
} from 'lucide-react';

const navigationItems = [
  {
    title: 'Dashboard',
    icon: Home,
    path: '/dashboard',
  },
  {
    title: 'Subs',
    icon: Users,
    path: '/subs',
  },
  {
    title: 'Tributes',
    icon: DollarSign,
    path: '/tributes',
  },
  {
    title: 'Chat Assistant',
    icon: MessageSquare,
    path: '/chat',
  },
  {
    title: 'Caption Generator',
    icon: FileText,
    path: '/captions',
  },
  {
    title: 'Task Generator',
    icon: CheckSquare,
    path: '/tasks',
  },
  {
    title: 'Response Templates',
    icon: MessageCircle,
    path: '/templates',
  },
  {
    title: 'Twitter Generator',
    icon: Twitter,
    path: '/twitter',
  },
  {
    title: 'Reddit Generator',
    icon: MessageCircle,
    path: '/reddit',
  },
  {
    title: 'Image Vision',
    icon: Image,
    path: '/vision',
  },
  {
    title: 'Checklists',
    icon: CheckSquare,
    path: '/checklists',
  },
  {
    title: 'Pricing',
    icon: CreditCard,
    path: '/pricing',
  },
  {
    title: 'Settings',
    icon: Settings,
    path: '/settings',
  },
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
          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
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
                  className={`
                    w-full justify-start
                    ${isActive 
                      ? 'bg-purple-100 text-purple-900 dark:bg-purple-900 dark:text-purple-100' 
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                    }
                  `}
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

export default AppSidebar;