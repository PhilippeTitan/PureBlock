import { Platform } from 'react-native';
import * as Network from 'expo-network';
import { Profile, BlockedApp, BlockedWebsite, Schedule } from '../types';
import {
  getProfiles,
  getBlockedApps,
  getBlockedWebsites,
  getSchedules,
  getLastSyncTime,
  setLastSyncTime,
} from './localStore';

const API_BASE = ''; // Set to backend URL when deployed

interface SyncResult {
  success: boolean;
  synced: number;
  errors: string[];
}

async function isOnline(): Promise<boolean> {
  if (Platform.OS === 'web') return navigator.onLine;
  const net = await Network.getNetworkStateAsync();
  return net.isConnected ?? false;
}

async function apiCall<T>(path: string, options?: RequestInit): Promise<T> {
  if (!API_BASE) throw new Error('No API base URL configured');
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// Push local data to server
export async function pushToServer(userId: string): Promise<SyncResult> {
  if (!(await isOnline())) return { success: false, synced: 0, errors: ['Offline'] };

  const errors: string[] = [];
  let synced = 0;

  try {
    const [profiles, blockedApps, blockedWebsites, schedules] = await Promise.all([
      getProfiles(),
      getBlockedApps(),
      getBlockedWebsites(),
      getSchedules(),
    ]);

    // Push profiles
    for (const p of profiles) {
      try {
        await apiCall('/api/profiles', {
          method: 'POST',
          body: JSON.stringify({ ...p, userId }),
        });
        synced++;
      } catch (e: any) {
        errors.push(`Profile ${p.id}: ${e.message}`);
      }
    }

    // Push blocked apps
    for (const app of blockedApps) {
      try {
        await apiCall('/api/blocked-apps', {
          method: 'POST',
          body: JSON.stringify({ ...app, userId }),
        });
        synced++;
      } catch (e: any) {
        errors.push(`App ${app.id}: ${e.message}`);
      }
    }

    // Push blocked websites
    for (const w of blockedWebsites) {
      try {
        await apiCall('/api/blocked-websites', {
          method: 'POST',
          body: JSON.stringify({ ...w, userId }),
        });
        synced++;
      } catch (e: any) {
        errors.push(`Website ${w.id}: ${e.message}`);
      }
    }

    // Push schedules
    for (const s of schedules) {
      try {
        await apiCall('/api/schedules', {
          method: 'POST',
          body: JSON.stringify({ ...s, userId }),
        });
        synced++;
      } catch (e: any) {
        errors.push(`Schedule ${s.id}: ${e.message}`);
      }
    }

    if (errors.length === 0) {
      await setLastSyncTime(new Date().toISOString());
    }
  } catch (e: any) {
    errors.push(`Sync failed: ${e.message}`);
  }

  return { success: errors.length === 0, synced, errors };
}

// Pull data from server to local
export async function pullFromServer(userId: string): Promise<SyncResult> {
  if (!(await isOnline())) return { success: false, synced: 0, errors: ['Offline'] };

  const errors: string[] = [];
  let synced = 0;

  try {
    // Pull each entity type from server
    const [profiles, apps, websites, schedules] = await Promise.all([
      apiCall<Profile[]>(`/api/profiles?userId=${userId}`).catch(() => []),
      apiCall<BlockedApp[]>(`/api/blocked-apps?userId=${userId}`).catch(() => []),
      apiCall<BlockedWebsite[]>(`/api/blocked-websites?userId=${userId}`).catch(() => []),
      apiCall<Schedule[]>(`/api/schedules?userId=${userId}`).catch(() => []),
    ]);

    // Save to local storage
    const { saveProfiles, saveBlockedApps, saveBlockedWebsites, saveSchedules } = await import('./localStore');

    if (profiles.length > 0) {
      await saveProfiles(profiles);
      synced += profiles.length;
    }
    if (apps.length > 0) {
      await saveBlockedApps(apps);
      synced += apps.length;
    }
    if (websites.length > 0) {
      await saveBlockedWebsites(websites);
      synced += websites.length;
    }
    if (schedules.length > 0) {
      await saveSchedules(schedules);
      synced += schedules.length;
    }

    await setLastSyncTime(new Date().toISOString());
  } catch (e: any) {
    errors.push(`Pull failed: ${e.message}`);
  }

  return { success: errors.length === 0, synced, errors };
}

// Full sync: push then pull
export async function fullSync(userId: string): Promise<SyncResult> {
  const push = await pushToServer(userId);
  const pull = await pullFromServer(userId);

  return {
    success: push.success && pull.success,
    synced: push.synced + pull.synced,
    errors: [...push.errors, ...pull.errors],
  };
}
