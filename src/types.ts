export interface App {
  packageName: string;
  name: string;
  icon?: string;
}

export interface BlockedApp {
  id: string;
  profileId: string;
  packageName: string;
  appName: string;
  isActive: boolean;
  createdAt: string;
}

export interface BlockedWebsite {
  id: string;
  profileId: string;
  url: string;
  isActive: boolean;
  createdAt: string;
}

export interface Profile {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Schedule {
  id: string;
  profileId: string;
  dayOfWeek: number; // 0-6 (Sun-Sat)
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  isActive: boolean;
  createdAt: string;
}

export interface BlockSession {
  id: string;
  userId: string;
  profileId?: string;
  startedAt: string;
  endedAt?: string;
  isActive: boolean;
}

export interface BlockedAttempt {
  id: string;
  userId: string;
  appPackage?: string;
  url?: string;
  blockedAt: string;
  sessionId?: string;
}

export interface Stats {
  totalBlocked: number;
  dailyBlocked: number;
  weeklyBlocked: number;
  monthlyBlocked: number;
  topBlockedApps: { packageName: string; count: number }[];
}

export interface Settings {
  strictMode: boolean;
  pinHash?: string;
  notificationsEnabled: boolean;
  theme: 'dark' | 'light';
}

export interface SavedLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number; // meters
  profileId: string;
  isActive: boolean;
  createdAt: string;
}
