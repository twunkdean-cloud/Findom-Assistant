import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useFindomActions } from '@/hooks/use-findom-actions';
import { FindomContextType } from '@/types';
import { DEFAULT_APP_DATA } from '@/constants/default-data';
import { AppData } from '@/types';
import { userDataService } from '@/services/user-data-service';
import { subsService } from '@/services/subs-service';
import { tributesService } from '@/services/tributes-service';
import { customPricesService } from '@/services/custom-prices-service';
import { calendarService } from '@/services/calendar-service';
import { redflagsService } from '@/services/redflags-service';
import { checklistsService } from '@/services/checklists-service';

const FindomContext = createContext<FindomContextType | undefined>(undefined);

export const useFindom = () => {
  const context = useContext(FindomContext);
  if (!context) {
    throw new Error('useFindom must be used within a FindomProvider');
  }
  return context;
};

export const FindomProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appData, setAppData] = useState<AppData>(DEFAULT_APP_DATA);
  const [loading, setLoading] = useState(true);
  const actions = useFindomActions(appData, setAppData);

  useEffect(() => {
    // For now, just set loading to false since we don't have auth
    setLoading(false);
  }, []);

  const value = {
    appData,
    setAppData,
    loading,
    ...actions,
  };

  return (
    <FindomContext.Provider value={value}>
      {children}
    </FindomContext.Provider>
  );
};