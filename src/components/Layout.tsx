import React, { ReactNode, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  LogOut,
  User,
  Menu,
  Home,
  Users,
  DollarSign,
  MessageSquare,
  Calendar,
  Settings,
  Brain,
  Twitter,
  FileText,
  Camera,
  CheckSquare,
  CreditCard,
  ListChecks,
  ChevronRight,
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { 
    id: 'dashboard', 
    label: 'Dashboard', 
    path: '/', 
    icon: Home,
    description: 'Overview & Analytics'
  },
  { 
    id: 'subs', 
    label: 'Sub Tracker', 
    path: '/subs', 
    icon: Users,
    description: 'Manage your subs'
  },
  { 
    id: 'tributes', 
    label: 'Tributes', 
    path: '/tributes', 
    icon: DollarSign,
    description: 'Track payments'
  },
  { 
    id: 'tasks', 
    label: 'Tasks', 
    path: '/tasks', 
    icon: ListChecks,
    description: 'Generate tasks'
  },
  { 
    id: 'responses', 
    label: 'Responses', 
    path: '/responses', 
    icon: MessageSquare,
    description: 'Message templates'
  },
  { 
    id: 'twitter', 
    label: 'Twitter', 
    path: '/twitter', 
    icon: Twitter,
    description: 'Twitter content'
  },
  { 
    id: 'reddit', 
    label: 'Reddit', 
    path: '/reddit', 
    icon: FileText,
    description: 'Reddit content'
  },
  { 
    id: 'caption', 
    label: 'Captions', 
    path: '/caption', 
    icon: FileText,
    description: 'Photo captions'
  },
  { 
    id: 'image-vision', 
    label: 'Image Vision', 
    path: '/image-vision', 
    icon: Camera,
    description: 'AI image analysis'
  },
  { 
    id: 'chat-assistant', 
    label: 'Chat AI', 
    path: '/chat-assistant', 
    icon: Brain,
    description: 'AI assistant'
  },
  { 
    id: 'calendar', 
    label: 'Calendar', 
    path: '/checklist', 
    icon: Calendar,
    description: 'Content calendar'
  },
  { 
    id: 'pricing', 
    label: 'Pricing', 
    path: '/pricing', 
    icon: CreditCard,
    description: 'Subscription'
  },
  { 
    id: 'settings', 
    label: 'Settings', 
    path: '/settings', 
    icon: Settings,
    description: 'App settings'
  },
];

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const NavItem = ({ item, isMobile = false }: { item: typeof navItems[0]; isMobile?: boolean }) => {
    const isActive = location.pathname === item.path;
    const Icon = item.icon;

    if (isMobile) {
      return (
        <button
          onClick={() => {
            navigate(item.path);
            setSidebarOpen(false);
          }}
          className={cn(
            "w-full flex items-center justify-between p-3 rounded-lg transition-all",
            "hover:bg-gray-800",
            isActive 
              ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg" 
              : "text-gray-300 hover:text-white"
          )}
        >
          <div className="flex items-center space-x-3">
            <Icon className="h-5 w-5" />
            <div className="text-left">
              <div className="font-medium">{item.label}</div>
              <div className="text-xs opacity-75">{item.description}</div>
            </div>
          </div>
          {isActive && <ChevronRight className="h-4 w-4" />}
        </button>
      );
    }

    return (
      <button
        onClick={() => navigate(item.path)}
        className={cn(
          "group relative p-3 rounded-xl transition-all duration-200",
          "hover:bg-gray-800/50",
          isActive 
            ? "bg-gradient-to-r from-indigo-600/20 to-purple-600/20 text-white border border-indigo-500/30" 
            : "text-gray-400 hover:text-gray-200"
        )}
      >
        <div className="flex flex-col items-center space-y-2">
          <div className={cn(
            "p-2 rounded-lg transition-all",
            isActive 
              ? "bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg" 
              : "bg-gray-800 group-hover:bg-gray-700"
          )}>
            <Icon className="h-5 w-5" />
          </div>
          <span className="text-xs font-medium text-center">{item.label}</span>
        </div>
        {isActive && (
          <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full" />
        )}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Mobile menu trigger */}
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden text-gray-400 hover:text-white">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 bg-gray-900 border-gray-800 p-0">
                <div className="p-6">
                  <h2 className="text-xl font-bold text-white mb-6">Navigation</h2>
                  <div className="space-y-2">
                    {navItems.map((item) => (
                      <NavItem key={item.id} item={item} isMobile />
                    ))}
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="hidden lg:block">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Switch Dean's Assistant
                </h1>
                <p className="text-xs text-gray-500">Complete Findom Automation Suite</p>
              </div>
              <div className="lg:hidden">
                <h1 className="text-lg font-bold text-white">SD Assistant</h1>
              </div>
            </div>

            {/* User menu */}
            {user && (
              <div className="flex items-center space-x-4">
                <Badge variant="outline" className="hidden sm:flex items-center space-x-1 bg-gray-800 border-gray-700 text-gray-300">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs">Online</span>
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-gray-400 hover:text-white">
                      <User className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">{user.email?.split('@')[0]}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                    <DropdownMenuItem className="text-gray-300 focus:text-white focus:bg-gray-700">
                      <User className="h-4 w-4 mr-2" />
                      {user.email}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-700" />
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-400 focus:text-red-300 focus:bg-gray-700">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Desktop Navigation */}
      <nav className="hidden lg:block sticky top-16 z-40 bg-gray-900/50 backdrop-blur-sm border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 py-4 overflow-x-auto">
            {navItems.map((item) => (
              <NavItem key={item.id} item={item} />
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20">
        {children}
      </main>
    </div>
  );
};

export default Layout;