import { AppData } from '@/types';

const LOCAL_STORAGE_KEY = 'findom_app_data';

export const loadLocalAppData = (): Partial<AppData> => {
  const raw = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_KEY) : null;
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed ?? {};
  } catch {
    return {};
  }
};

export const saveLocalAppData = (partial: Partial<AppData>): void => {
  if (typeof window === 'undefined') return;
  const current = loadLocalAppData();
  const merged = { ...current, ...partial };
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
};

export const clearLocalAppData = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(LOCAL_STORAGE_KEY);
};