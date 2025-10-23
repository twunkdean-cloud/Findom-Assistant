import React, { createContext, useContext, ReactNode } from 'react';
import { useFindomData } from '@/hooks/use-findom-data';
import { useFindomActions } from '@/hooks/use-findom-actions';
import { FindomContextType } from '@/types';

const FindomContext = createContext<FindomContextType | undefined>(undefined);

export const FindomProvider = ({ children }: { children: ReactNode }) => {
  const { appData, setAppData, loading } = useFindomData();
  const actions = useFindomActions(appData, setAppData);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <FindomContext.Provider value={{
      appData,
      ...actions,
    }}>
      {children}
    </FindomContext.Provider>
  );
};

export const useFindom = () => {
  const context = useContext(FindomContext);
  if (context === undefined) {
    throw new Error('useFindom must be used within a FindomProvider');
  }
  return context;
};