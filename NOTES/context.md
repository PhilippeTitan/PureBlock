# PureBlock — Active Context

## Current State
15/22 features complete. Remaining 5 need Android Studio.

## Last Session
- **Date:** 2026-08-09
- **Focus:** Features sprint — location profiles, notifications, backup, test blocking
- **Status:** Complete

## What's Done
- ✅ Expo project with TypeScript, React Navigation
- ✅ 10 screens: Home, Blocking, Stats, Settings, Profiles, Schedule, Blocker, Onboarding, WebsiteBlocking, LocationProfiles
- ✅ Dark theme (blue/teal/gold), safe areas on all screens
- ✅ Navigation (bottom tabs + stack + modal)
- ✅ Offline-first local storage (AsyncStorage) + sync engine
- ✅ Express.js backend API for sync
- ✅ App listing from device (mock fallback for Expo Go)
- ✅ Blocking overlay with motivational quotes
- ✅ Quick block toggle
- ✅ Multiple profiles (Work, Sleep, Study)
- ✅ Time-based schedules
- ✅ Website blocking (add/remove URLs)
- ✅ Onboarding flow (5 steps)
- ✅ Emergency unlock codes (one-time-use, max 3, 24h cooldown)
- ✅ Usage statistics dashboard (daily/weekly/monthly charts)
- ✅ Pomodoro timer (25/5/15)
- ✅ Mood check-in (5-point scale, streak tracking)
- ✅ Location-based profiles (#16) — GPS detection, radius presets, profile linking
- ✅ Motivational notifications — 30 quotes, daily 8 AM, streak reminders
- ✅ Data export/import — backup/restore via JSON file sharing
- ✅ Test blocking button on Home screen

## What's Next
- ⏳ #4 Native Kotlin module skeleton (needs Android Studio ~600MB)
- ⏳ #6 App blocking via foreground service (needs native)
- ⏳ #13 Strict mode / device admin (needs native)
- ⏳ #14 PIN protection (UI exists, needs native enforcement)
- ⏳ #17 Blocked attempts counter (schema ready)
- ⏳ #22 WiFi-based profiles (needs native WiFi detection)

## Feature Progress
- Completed: 15/22
- In Progress: 5 (all need Android Studio)
- Not Built: 2 (WiFi profiles, blocked attempts counter)

## Blockers
- Android Studio not installed (~600MB, slow internet)

## User Preferences
- Same MD logic as MaurMaket for infinite sessions
- Prefers VS Code over Android Studio
- Dark theme, minimal UI
- Neon PostgreSQL for cloud DB (offline-first)
- GitHub for repo management

## Database
- **Neon Project:** PureBlock (long-base-77380238)
- **Tables:** users, profiles, blocked_apps, blocked_websites, schedules, block_sessions, blocked_attempts, user_settings, sync_queue

## Key Files
- `AGENTS.md` — Session protocol + feature checklist (THE source of truth)
- `src/services/notifications.ts` — Motivational quotes + daily scheduling
- `src/services/backup.ts` — JSON export/import
- `src/screens/LocationProfilesScreen.tsx` — Location CRUD + GPS
- `src/store/localStore.ts` — AsyncStorage CRUD (all data)
- `src/store/useStore.ts` — Reactive store with all actions
- `src/store/StoreContext.tsx` — React context provider
