import React from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import MigrationHelper from './MigrationHelper';
import { OfflineIndicator } from './OfflineIndicator';
import { MobileBottomNav } from './MobileBottomNav';

export const Layout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 px-4 border-b">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1" />
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          <MigrationHelper />
          {children || <Outlet />}
        </main>
      </SidebarInset>
      <OfflineIndicator />
      <MobileBottomNav />
    </SidebarProvider>
  );
};

export default Layout;