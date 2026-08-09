import React, { createContext, useContext } from 'react';
import { useStore, AppState } from './useStore';

const StoreContext = createContext<AppState & {
  addProfile: (name: string) => Promise<any>;
  updateProfile: (id: string, updates: Partial<any>) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  addBlockedApp: (profileId: string, packageName: string, appName: string) => Promise<any>;
  removeBlockedApp: (id: string) => Promise<void>;
  addBlockedWebsite: (profileId: string, url: string) => Promise<any>;
  removeBlockedWebsite: (id: string) => Promise<void>;
  addSchedule: (schedule: any) => Promise<any>;
  deleteSchedule: (id: string) => Promise<void>;
  updateSettings: (updates: any) => Promise<void>;
  sync: () => Promise<any>;
} | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const store = useStore();
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useAppStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useAppStore must be used within StoreProvider');
  return ctx;
}
