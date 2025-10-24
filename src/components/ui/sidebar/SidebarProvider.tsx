import React, { createContext, useContext, useState, ReactNode } from 'react';

type SidebarContextType = {
  state: 'expanded' | 'collapsed';
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}

export function SidebarProvider({
  children,
  defaultOpen = false,
}: {
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [openMobile, setOpenMobile] = useState(false);
  const isMobile = false; // Simplified for now

  return (
    <SidebarContext.Provider value={{ state: open ? 'expanded' : 'collapsed', open, setOpen, openMobile, setOpenMobile, isMobile }}>
      {children}
    </SidebarContext.Provider>
  );
}