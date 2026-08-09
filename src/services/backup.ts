import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import {
  getProfiles,
  getBlockedApps,
  getBlockedWebsites,
  getSchedules,
  getSettings,
  getLocations,
  getUserId,
} from '../store/localStore';

export interface BackupData {
  version: 1;
  exportedAt: string;
  userId: string | null;
  profiles: any[];
  blockedApps: any[];
  blockedWebsites: any[];
  schedules: any[];
  settings: any;
  locations: any[];
}

export async function exportBackup(): Promise<string> {
  const [profiles, blockedApps, blockedWebsites, schedules, settings, locations, userId] =
    await Promise.all([
      getProfiles(),
      getBlockedApps(),
      getBlockedWebsites(),
      getSchedules(),
      getSettings(),
      getLocations(),
      getUserId(),
    ]);

  const data: BackupData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    userId,
    profiles,
    blockedApps,
    blockedWebsites,
    schedules,
    settings,
    locations,
  };

  return JSON.stringify(data, null, 2);
}

export async function shareBackup(): Promise<boolean> {
  try {
    const json = await exportBackup();
    const fileName = `pureblock-backup-${new Date().toISOString().split('T')[0]}.json`;
    const fileUri = FileSystem.documentDirectory + fileName;

    await FileSystem.writeAsStringAsync(fileUri, json, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    const canShare = await Sharing.isAvailableAsync();
    if (!canShare) return false;

    await Sharing.shareAsync(fileUri, {
      mimeType: 'application/json',
      dialogTitle: 'Export PureBlock Backup',
      UTI: 'public.json',
    });

    return true;
  } catch {
    return false;
  }
}

export async function importBackup(jsonString: string): Promise<{ success: boolean; message: string }> {
  try {
    const data = JSON.parse(jsonString) as BackupData;

    if (!data.version || data.version !== 1) {
      return { success: false, message: 'Invalid backup file format' };
    }

    if (!data.profiles || !Array.isArray(data.profiles)) {
      return { success: false, message: 'Backup file is corrupted or invalid' };
    }

    // Import data into AsyncStorage
    const promises: Promise<void>[] = [];

    if (data.userId) {
      promises.push(
        AsyncStorage.setItem('@pureblock/user_id', JSON.stringify(data.userId))
      );
    }

    if (data.profiles) {
      promises.push(
        AsyncStorage.setItem('@pureblock/profiles', JSON.stringify(data.profiles))
      );
    }

    if (data.blockedApps) {
      promises.push(
        AsyncStorage.setItem('@pureblock/blocked_apps', JSON.stringify(data.blockedApps))
      );
    }

    if (data.blockedWebsites) {
      promises.push(
        AsyncStorage.setItem('@pureblock/blocked_websites', JSON.stringify(data.blockedWebsites))
      );
    }

    if (data.schedules) {
      promises.push(
        AsyncStorage.setItem('@pureblock/schedules', JSON.stringify(data.schedules))
      );
    }

    if (data.settings) {
      promises.push(
        AsyncStorage.setItem('@pureblock/settings', JSON.stringify(data.settings))
      );
    }

    if (data.locations) {
      promises.push(
        AsyncStorage.setItem('@pureblock/locations', JSON.stringify(data.locations))
      );
    }

    await Promise.all(promises);

    return {
      success: true,
      message: `Restored ${data.profiles.length} profiles, ${data.blockedApps.length} blocked apps, ${data.blockedWebsites.length} blocked websites, ${data.schedules.length} schedules, ${data.locations.length} locations`,
    };
  } catch {
    return { success: false, message: 'Failed to parse backup file' };
  }
}

export function parseBackupPreview(jsonString: string): BackupData | null {
  try {
    const data = JSON.parse(jsonString) as BackupData;
    if (data.version !== 1) return null;
    return data;
  } catch {
    return null;
  }
}
