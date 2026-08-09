import { NativeModules, Platform } from 'react-native';

const { PureBlockModule } = NativeModules;

export interface ForegroundApp {
  packageName: string;
  className: string;
}

const isNativeAvailable = Platform.OS === 'android' && PureBlockModule != null;

export const PureBlockNative = {
  isUsagePermissionGranted: async (): Promise<boolean> => {
    if (!isNativeAvailable) return false;
    return PureBlockModule.isUsagePermissionGranted();
  },

  openUsagePermissionSettings: () => {
    if (!isNativeAvailable) return;
    PureBlockModule.openUsagePermissionSettings();
  },

  isAccessibilityServiceEnabled: async (): Promise<boolean> => {
    if (!isNativeAvailable) return false;
    return PureBlockModule.isAccessibilityServiceEnabled();
  },

  openAccessibilitySettings: () => {
    if (!isNativeAvailable) return;
    PureBlockModule.openAccessibilitySettings();
  },

  startBlockingService: (blockedPackages: string[], blockedUrls: string[]) => {
    if (!isNativeAvailable) return;
    PureBlockModule.startBlockingService(blockedPackages, blockedUrls);
  },

  stopBlockingService: () => {
    if (!isNativeAvailable) return;
    PureBlockModule.stopBlockingService();
  },

  showBlockOverlay: (packageName: string, appName: string) => {
    if (!isNativeAvailable) return;
    PureBlockModule.showBlockOverlay(packageName, appName);
  },

  requestNotificationPermission: () => {
    if (!isNativeAvailable) return;
    PureBlockModule.requestNotificationPermission();
  },

  isDeviceAdminActive: async (): Promise<boolean> => {
    if (!isNativeAvailable) return false;
    return PureBlockModule.isDeviceAdminActive();
  },

  requestDeviceAdmin: () => {
    if (!isNativeAvailable) return;
    PureBlockModule.requestDeviceAdmin();
  },

  removeDeviceAdmin: () => {
    if (!isNativeAvailable) return;
    PureBlockModule.removeDeviceAdmin();
  },

  getForegroundApp: async (): Promise<ForegroundApp | null> => {
    if (!isNativeAvailable) return null;
    return PureBlockModule.getForegroundApp();
  },
};
