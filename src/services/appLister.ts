import { Platform } from 'react-native';

export interface InstalledApp {
  packageName: string;
  appName: string;
  versionName?: string;
}

// Common apps for development/testing
const MOCK_APPS: InstalledApp[] = [
  { packageName: 'com.instagram.android', appName: 'Instagram', versionName: '302.0.0' },
  { packageName: 'com.facebook.katana', appName: 'Facebook', versionName: '400.0.0' },
  { packageName: 'com.twitter.android', appName: 'X (Twitter)', versionName: '10.0.0' },
  { packageName: 'com.tiktok.android', appName: 'TikTok', versionName: '30.0.0' },
  { packageName: 'com.snapchat.android', appName: 'Snapchat', versionName: '12.0.0' },
  { packageName: 'com.reddit.frontpage', appName: 'Reddit', versionName: '2024.0.0' },
  { packageName: 'com.youtube.android', appName: 'YouTube', versionName: '19.0.0' },
  { packageName: 'com.netflix.mediaclient', appName: 'Netflix', versionName: '8.0.0' },
  { packageName: 'com.spotify.music', appName: 'Spotify', versionName: '9.0.0' },
  { packageName: 'com.discord', appName: 'Discord', versionName: '200.0.0' },
  { packageName: 'com.telegram.messenger', appName: 'Telegram', versionName: '10.0.0' },
  { packageName: 'com.whatsapp', appName: 'WhatsApp', versionName: '2.24.0' },
  { packageName: 'com.google.android.gm', appName: 'Gmail', versionName: '2024.0.0' },
  { packageName: 'com.google.android.apps.maps', appName: 'Google Maps', versionName: '2024.0.0' },
  { packageName: 'com.android.chrome', appName: 'Chrome', versionName: '120.0.0' },
  { packageName: 'com.amazon.mShop.android.shopping', appName: 'Amazon', versionName: '2024.0.0' },
  { packageName: 'com.shopee', appName: 'Shopee', versionName: '2024.0.0' },
  { packageName: 'com.lazada.android', appName: 'Lazada', versionName: '2024.0.0' },
];

export async function getInstalledApps(): Promise<InstalledApp[]> {
  // On web or development, return mock data
  if (Platform.OS === 'web' || __DEV__) {
    return MOCK_APPS;
  }

  // On real Android device, use native module
  try {
    const { ExpoAndroidAppList } = await import('expo-android-app-list');
    const apps = await ExpoAndroidAppList.getAll();
    return apps.map(app => ({
      packageName: app.packageName,
      appName: app.appName,
      versionName: app.versionName,
    }));
  } catch (e) {
    console.warn('Native app list failed, using mock data:', e);
    return MOCK_APPS;
  }
}

export async function getAppIcon(packageName: string): Promise<string | null> {
  if (Platform.OS === 'web' || __DEV__) {
    return null;
  }

  try {
    const { ExpoAndroidAppList } = await import('expo-android-app-list');
    const icon = await ExpoAndroidAppList.getAppIcon(packageName, 100);
    return icon;
  } catch (e) {
    return null;
  }
}
