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
  saveProfiles,
  saveBlockedApps,
  saveBlockedWebsites,
  saveSchedules,
} from './localStore';
import {
  saveProfile,
  saveBlockedApp,
  saveBlockedWebsite,
  saveSchedule,
  fetchProfiles,
  fetchBlockedApps,
  fetchBlockedWebsites,
  fetchSchedules,
} from '../api';

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

    for (const p of profiles) {
      try {
        await saveProfile(p, userId);
        synced++;
      } catch (e: any) {
        errors.push(`Profile ${p.id}: ${e.message}`);
      }
    }

    for (const app of blockedApps) {
      try {
        await saveBlockedApp(app, userId);
        synced++;
      } catch (e: any) {
        errors.push(`App ${app.id}: ${e.message}`);
      }
    }

    for (const w of blockedWebsites) {
      try {
        await saveBlockedWebsite(w, userId);
        synced++;
      } catch (e: any) {
        errors.push(`Website ${w.id}: ${e.message}`);
      }
    }

    for (const s of schedules) {
      try {
        await saveSchedule(s, userId);
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
    const [profiles, apps, websites, schedules] = await Promise.all([
      fetchProfiles(userId).catch(() => []),
      fetchBlockedApps(userId).catch(() => []),
      fetchBlockedWebsites(userId).catch(() => []),
      fetchSchedules(userId).catch(() => []),
    ]);

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
