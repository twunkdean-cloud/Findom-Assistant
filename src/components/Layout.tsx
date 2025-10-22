import React, { ReactNode } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { MadeWithDyad } from './made-with-dyad';
import MigrationHelper from './MigrationHelper';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', path: '/' },
  { id: 'twitter', label: 'Twitter', path: '/twitter' },
  { id: 'reddit', label: 'Reddit', path: '/reddit' },
  { id: 'caption', label: 'Captions', path: '/caption' },
  { id: 'prompts', label: 'Image Vision', path: '/image-vision' },
  { id: 'responses', label: 'Responses', path: '/responses' },
  { id: 'subs', label: 'Sub Tracker', path: '/subs' },
  { id: 'tributes', label: 'Tributes', path: '/tributes' },
  { id: 'tasks', label: 'Tasks', path: '/tasks' },
  { id: 'chat-assistant', label: 'Chat AI', path: '/chat-assistant' },
  { id: 'pricing', label: 'Pricing', path: '/pricing' },
  { id: 'settings', label: 'Settings', path: '/settings' },
  { id: 'checklist', label: 'Checklist', path: '/checklist' },
];

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const currentTab = navItems.find(item => item.path === location.pathname)?.id || 'dashboard';

  return (
    <div className="max-w-6xl mx-auto min-h-screen bg-gray-900 text-gray-200">
      <header className="bg-gradient-to-r from-indigo-700 to-purple-800 text-white p-6 text-center shadow-lg">
        <h1 className="text-3xl font-bold tracking-wider">Switch Dean's Assistant</h1>
        <p className="text-sm mt-2 opacity-90">Complete Findom Automation Suite</p>
      </header>

      <Tabs value={currentTab} className="w-full">
        <TabsList className="flex flex-wrap border-b border-gray-700 h-auto p-0 bg-gray-900">
          {navItems.map((item) => (
            <TabsTrigger
              key={item.id}
              value={item.id}
              asChild
              className={cn(
                "flex-1 min-w-fit p-3 font-semibold text-xs",
                "bg-transparent text-gray-400 border-b-2 border-transparent",
                "hover:bg-gray-800 hover:text-gray-200",
                location.pathname === item.path && "border-indigo-500 text-gray-200 bg-gray-800"
              )}
            >
              <Link to={item.path}>{item.label}</Link>
            </TabsTrigger>
          ))}
        </TabsList>
        <main className="p-6">
          <MigrationHelper />
          {children}
        </main>
      </Tabs>
      <MadeWithDyad />
    </div>
  );
};

export default Layout;