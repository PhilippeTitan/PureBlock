import { useState, useEffect, useCallback } from 'react';
import { Profile, BlockedApp, BlockedWebsite, Schedule, Settings, SavedLocation } from '../types';
import {
  loadAllLocalData,
  saveProfiles,
  addProfile as localAddProfile,
  updateProfile as localUpdateProfile,
  deleteProfile as localDeleteProfile,
  saveBlockedApps,
  addBlockedApp as localAddBlockedApp,
  removeBlockedApp as localRemoveBlockedApp,
  saveBlockedWebsites,
  addBlockedWebsite as localAddBlockedWebsite,
  removeBlockedWebsite as localRemoveBlockedWebsite,
  saveSchedules,
  addSchedule as localAddSchedule,
  deleteSchedule as localDeleteSchedule,
  saveSettings as localSaveSettings,
  saveLocations,
  addLocation as localAddLocation,
  deleteLocation as localDeleteLocation,
  setUserId as localSetUserId,
  getUserId,
} from './localStore';
import { fullSync } from './syncEngine';
import { generateId } from '../utils';

export interface AppState {
  userId: string | null;
  profiles: Profile[];
  blockedApps: BlockedApp[];
  blockedWebsites: BlockedWebsite[];
  schedules: Schedule[];
  locations: SavedLocation[];
  settings: Settings;
  isOnline: boolean;
  lastSync: string | null;
  isLoading: boolean;
  isBlocking: boolean;
  blockingSince: string | null;
}

export function useStore() {
  const [state, setState] = useState<AppState>({
    userId: null,
    profiles: [],
    blockedApps: [],
    blockedWebsites: [],
    schedules: [],
    locations: [],
    settings: { strictMode: false, notificationsEnabled: true, theme: 'dark' },
    isOnline: false,
    lastSync: null,
    isLoading: true,
    isBlocking: false,
    blockingSince: null,
  });

  // Initialize: load local data, generate userId if needed
  useEffect(() => {
    (async () => {
      let uid = await getUserId();
      if (!uid) {
        uid = generateId();
        await localSetUserId(uid);
      }

      const data = await loadAllLocalData();
      setState({
        ...data,
        userId: uid,
        isOnline: false,
        isLoading: false,
        isBlocking: false,
        blockingSince: null,
      });
    })();
  }, []);

  // --- Profiles ---
  const addProfile = useCallback(async (name: string) => {
    const profile: Profile = {
      id: generateId(),
      name,
      isActive: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await localAddProfile(profile);
    setState(s => ({ ...s, profiles: [...s.profiles, profile] }));
    return profile;
  }, []);

  const updateProfile = useCallback(async (id: string, updates: Partial<Profile>) => {
    await localUpdateProfile(id, updates);
    setState(s => ({
      ...s,
      profiles: s.profiles.map(p => (p.id === id ? { ...p, ...updates } : p)),
    }));
  }, []);

  const deleteProfile = useCallback(async (id: string) => {
    await localDeleteProfile(id);
    setState(s => ({ ...s, profiles: s.profiles.filter(p => p.id !== id) }));
  }, []);

  // --- Blocked Apps ---
  const addBlockedApp = useCallback(async (profileId: string, packageName: string, appName: string) => {
    const app: BlockedApp = {
      id: generateId(),
      profileId,
      packageName,
      appName,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    await localAddBlockedApp(app);
    setState(s => ({ ...s, blockedApps: [...s.blockedApps, app] }));
    return app;
  }, []);

  const removeBlockedApp = useCallback(async (id: string) => {
    await localRemoveBlockedApp(id);
    setState(s => ({ ...s, blockedApps: s.blockedApps.filter(a => a.id !== id) }));
  }, []);

  // --- Blocked Websites ---
  const addBlockedWebsite = useCallback(async (profileId: string, url: string) => {
    const website: BlockedWebsite = {
      id: generateId(),
      profileId,
      url,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    await localAddBlockedWebsite(website);
    setState(s => ({ ...s, blockedWebsites: [...s.blockedWebsites, website] }));
    return website;
  }, []);

  const removeBlockedWebsite = useCallback(async (id: string) => {
    await localRemoveBlockedWebsite(id);
    setState(s => ({ ...s, blockedWebsites: s.blockedWebsites.filter(w => w.id !== id) }));
  }, []);

  // --- Schedules ---
  const addSchedule = useCallback(async (schedule: Omit<Schedule, 'id' | 'createdAt'>) => {
    const full: Schedule = {
      ...schedule,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    await localAddSchedule(full);
    setState(s => ({ ...s, schedules: [...s.schedules, full] }));
    return full;
  }, []);

  const deleteSchedule = useCallback(async (id: string) => {
    await localDeleteSchedule(id);
    setState(s => ({ ...s, schedules: s.schedules.filter(s => s.id !== id) }));
  }, []);

  // --- Settings ---
  const updateSettings = useCallback(async (updates: Partial<Settings>) => {
    const merged = { ...state.settings, ...updates };
    await localSaveSettings(merged);
    setState(s => ({ ...s, settings: merged }));
  }, [state.settings]);

  // --- Locations ---
  const addLocation = useCallback(async (name: string, latitude: number, longitude: number, radius: number, profileId: string) => {
    const location: SavedLocation = {
      id: generateId(),
      name,
      latitude,
      longitude,
      radius,
      profileId,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    await localAddLocation(location);
    setState(s => ({ ...s, locations: [...s.locations, location] }));
    return location;
  }, []);

  const deleteLocation = useCallback(async (id: string) => {
    await localDeleteLocation(id);
    setState(s => ({ ...s, locations: s.locations.filter(l => l.id !== id) }));
  }, []);

  const toggleLocation = useCallback(async (id: string) => {
    setState(s => ({
      ...s,
      locations: s.locations.map(l =>
        l.id === id ? { ...l, isActive: !l.isActive } : l
      ),
    }));
  }, []);

  // --- Sync ---
  const sync = useCallback(async () => {
    if (!state.userId) return;
    const result = await fullSync(state.userId);
    if (result.success) {
      const data = await loadAllLocalData();
      setState(s => ({ ...s, ...data }));
    }
    return result;
  }, [state.userId]);

  // --- Quick Block ---
  const toggleBlocking = useCallback(async () => {
    setState(s => ({
      ...s,
      isBlocking: !s.isBlocking,
      blockingSince: !s.isBlocking ? new Date().toISOString() : null,
    }));
  }, []);

  const startBlocking = useCallback(async () => {
    setState(s => ({
      ...s,
      isBlocking: true,
      blockingSince: new Date().toISOString(),
    }));
  }, []);

  const stopBlocking = useCallback(async () => {
    setState(s => ({
      ...s,
      isBlocking: false,
      blockingSince: null,
    }));
  }, []);

  return {
    ...state,
    addProfile,
    updateProfile,
    deleteProfile,
    addBlockedApp,
    removeBlockedApp,
    addBlockedWebsite,
    removeBlockedWebsite,
    addSchedule,
    deleteSchedule,
    updateSettings,
    sync,
    addLocation,
    deleteLocation,
    toggleLocation,
    toggleBlocking,
    startBlocking,
    stopBlocking,
  };
}
