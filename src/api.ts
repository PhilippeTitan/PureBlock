import { Platform } from 'react-native';

const DEV_URL = Platform.select({
  android: 'http://10.0.2.2:3001',
  ios: 'http://localhost:3001',
  default: 'http://localhost:3001',
});

const API_BASE = __DEV__ ? DEV_URL : 'https://pureblock-api.onrender.com';

async function apiCall<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${body || res.statusText}`);
  }
  return res.json();
}

// --- Profiles ---
export async function fetchProfiles(userId: string) {
  return apiCall<any[]>(`/api/profiles?userId=${userId}`);
}

export async function saveProfile(profile: any, userId: string) {
  return apiCall('/api/profiles', {
    method: 'POST',
    body: JSON.stringify({ ...profile, userId }),
  });
}

// --- Blocked Apps ---
export async function fetchBlockedApps(userId: string) {
  return apiCall<any[]>(`/api/blocked-apps?userId=${userId}`);
}

export async function saveBlockedApp(app: any, userId: string) {
  return apiCall('/api/blocked-apps', {
    method: 'POST',
    body: JSON.stringify({ ...app, userId }),
  });
}

// --- Blocked Websites ---
export async function fetchBlockedWebsites(userId: string) {
  return apiCall<any[]>(`/api/blocked-websites?userId=${userId}`);
}

export async function saveBlockedWebsite(website: any, userId: string) {
  return apiCall('/api/blocked-websites', {
    method: 'POST',
    body: JSON.stringify({ ...website, userId }),
  });
}

// --- Schedules ---
export async function fetchSchedules(userId: string) {
  return apiCall<any[]>(`/api/schedules?userId=${userId}`);
}

export async function saveSchedule(schedule: any, userId: string) {
  return apiCall('/api/schedules', {
    method: 'POST',
    body: JSON.stringify({ ...schedule, userId }),
  });
}

// --- Health ---
export async function checkHealth() {
  return apiCall<{ status: string; db: string }>('/api/health');
}
