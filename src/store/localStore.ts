import AsyncStorage from '@react-native-async-storage/async-storage';
import { Profile, BlockedApp, BlockedWebsite, Schedule, Settings } from '../types';

const KEYS = {
  PROFILES: '@pureblock/profiles',
  BLOCKED_APPS: '@pureblock/blocked_apps',
  BLOCKED_WEBSITES: '@pureblock/blocked_websites',
  SCHEDULES: '@pureblock/schedules',
  SETTINGS: '@pureblock/settings',
  LAST_SYNC: '@pureblock/last_sync',
  USER_ID: '@pureblock/user_id',
  ONBOARDING_COMPLETE: '@pureblock/onboarding_complete',
} as const;

async function get<T>(key: string): Promise<T | null> {
  const raw = await AsyncStorage.getItem(key);
  return raw ? JSON.parse(raw) : null;
}

async function set<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

async function remove(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
}

// --- User ---
export async function getUserId(): Promise<string | null> {
  return get<string>(KEYS.USER_ID);
}

export async function setUserId(id: string): Promise<void> {
  await set(KEYS.USER_ID, id);
}

// --- Profiles ---
export async function getProfiles(): Promise<Profile[]> {
  return (await get<Profile[]>(KEYS.PROFILES)) ?? [];
}

export async function saveProfiles(profiles: Profile[]): Promise<void> {
  await set(KEYS.PROFILES, profiles);
}

export async function addProfile(profile: Profile): Promise<void> {
  const profiles = await getProfiles();
  profiles.push(profile);
  await saveProfiles(profiles);
}

export async function updateProfile(id: string, updates: Partial<Profile>): Promise<void> {
  const profiles = await getProfiles();
  const idx = profiles.findIndex(p => p.id === id);
  if (idx !== -1) {
    profiles[idx] = { ...profiles[idx], ...updates, updatedAt: new Date().toISOString() };
    await saveProfiles(profiles);
  }
}

export async function deleteProfile(id: string): Promise<void> {
  const profiles = await getProfiles();
  await saveProfiles(profiles.filter(p => p.id !== id));
}

// --- Blocked Apps ---
export async function getBlockedApps(): Promise<BlockedApp[]> {
  return (await get<BlockedApp[]>(KEYS.BLOCKED_APPS)) ?? [];
}

export async function saveBlockedApps(apps: BlockedApp[]): Promise<void> {
  await set(KEYS.BLOCKED_APPS, apps);
}

export async function addBlockedApp(app: BlockedApp): Promise<void> {
  const apps = await getBlockedApps();
  apps.push(app);
  await saveBlockedApps(apps);
}

export async function removeBlockedApp(id: string): Promise<void> {
  const apps = await getBlockedApps();
  await saveBlockedApps(apps.filter(a => a.id !== id));
}

// --- Blocked Websites ---
export async function getBlockedWebsites(): Promise<BlockedWebsite[]> {
  return (await get<BlockedWebsite[]>(KEYS.BLOCKED_WEBSITES)) ?? [];
}

export async function saveBlockedWebsites(websites: BlockedWebsite[]): Promise<void> {
  await set(KEYS.BLOCKED_WEBSITES, websites);
}

export async function addBlockedWebsite(website: BlockedWebsite): Promise<void> {
  const websites = await getBlockedWebsites();
  websites.push(website);
  await saveBlockedWebsites(websites);
}

export async function removeBlockedWebsite(id: string): Promise<void> {
  const websites = await getBlockedWebsites();
  await saveBlockedWebsites(websites.filter(w => w.id !== id));
}

// --- Schedules ---
export async function getSchedules(): Promise<Schedule[]> {
  return (await get<Schedule[]>(KEYS.SCHEDULES)) ?? [];
}

export async function saveSchedules(schedules: Schedule[]): Promise<void> {
  await set(KEYS.SCHEDULES, schedules);
}

export async function addSchedule(schedule: Schedule): Promise<void> {
  const schedules = await getSchedules();
  schedules.push(schedule);
  await saveSchedules(schedules);
}

export async function deleteSchedule(id: string): Promise<void> {
  const schedules = await getSchedules();
  await saveSchedules(schedules.filter(s => s.id !== id));
}

// --- Settings ---
export async function getSettings(): Promise<Settings> {
  const defaults: Settings = {
    strictMode: false,
    pinHash: undefined,
    notificationsEnabled: true,
    theme: 'dark',
  };
  return (await get<Settings>(KEYS.SETTINGS)) ?? defaults;
}

export async function saveSettings(settings: Settings): Promise<void> {
  await set(KEYS.SETTINGS, settings);
}

// --- Sync metadata ---
export async function getLastSyncTime(): Promise<string | null> {
  return get<string>(KEYS.LAST_SYNC);
}

export async function setLastSyncTime(iso: string): Promise<void> {
  await set(KEYS.LAST_SYNC, iso);
}

// --- Onboarding ---
export async function isOnboardingComplete(): Promise<boolean> {
  return (await get<boolean>(KEYS.ONBOARDING_COMPLETE)) ?? false;
}

export async function setOnboardingComplete(): Promise<void> {
  await set(KEYS.ONBOARDING_COMPLETE, true);
}

// --- Bulk load (for app init) ---
export async function loadAllLocalData() {
  const [profiles, blockedApps, blockedWebsites, schedules, settings, userId, lastSync] =
    await Promise.all([
      getProfiles(),
      getBlockedApps(),
      getBlockedWebsites(),
      getSchedules(),
      getSettings(),
      getUserId(),
      getLastSyncTime(),
    ]);

  return { profiles, blockedApps, blockedWebsites, schedules, settings, userId, lastSync };
}
