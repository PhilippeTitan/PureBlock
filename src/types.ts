export interface App {
  packageName: string;
  name: string;
  icon?: string;
  isBlocked: boolean;
}

export interface BlockedApp {
  packageName: string;
  profileId: string;
  addedAt: string;
}

export interface Profile {
  id: string;
  name: string;
  isActive: boolean;
  color: string;
  blockedApps: string[];
  blockedWebsites: string[];
  createdAt: string;
}

export interface Schedule {
  id: string;
  profileId: string;
  name: string;
  days: number[]; // 0-6 (Sun-Sat)
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  isActive: boolean;
}

export interface BlockSession {
  id: string;
  profileId: string;
  startedAt: string;
  endedAt?: string;
  blockedCount: number;
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
  pinCode?: string;
  quickBlockEnabled: boolean;
  notificationsEnabled: boolean;
  dailyReportEnabled: boolean;
}
