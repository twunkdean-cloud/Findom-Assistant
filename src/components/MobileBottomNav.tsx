import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, DollarSign, Bot } from 'lucide-react';
import { useMobile } from '@/hooks/use-mobile';

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Users, label: 'Subs', path: '/subs' },
  { icon: DollarSign, label: 'Tributes', path: '/tributes' },
  { icon: Bot, label: 'AI', path: '/ai-assistant' },
];

export const MobileBottomNav: React.FC = () => {
  const { isMobile } = useMobile();
  const location = useLocation();
  const navigate = useNavigate();

  if (!isMobile) return null;

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 md:hidden">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-colors ${
                active
                  ? 'text-indigo-600'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className={`h-6 w-6 ${active ? 'stroke-2' : ''}`} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
