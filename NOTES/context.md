# PureBlock — Active Context

## Current State
Website blocking screen complete. 10/22 features done.

## Last Session
- **Date:** 2026-08-09
- **Focus:** Website blocking, onboarding fix
- **Status:** Complete

## What's Done
- ✅ Analyzed AppBlock decompiled APK
- ✅ Decided on tech stack (Expo + Kotlin native)
- ✅ Created Expo project with TypeScript
- ✅ 9 screens with safe areas + sticky headers (Home, Blocking, Stats, Settings, Profiles, Schedule, Blocker, Onboarding, WebsiteBlocking)
- ✅ ScreenHeader component
- ✅ Navigation (tabs + stack + modal)
- ✅ Dark theme (blue/teal/gold)
- ✅ AGENTS.md with 22 features tracked + safe area rule
- ✅ Neon PostgreSQL schema (9 tables, migration applied)
- ✅ Offline-first local storage (AsyncStorage)
- ✅ Sync engine (local ↔ Neon)
- ✅ Store context (useAppStore hook)
- ✅ Screens wired to real data (Profiles, Blocking, Schedule, Settings)
- ✅ GitHub repo: https://github.com/PhilippeTitan/PureBlock
- ✅ Utility functions (ID generation, time helpers)
- ✅ App listing from device (expo-android-app-list)
- ✅ Blocking overlay screen with motivational quotes
- ✅ App lister service with mock data for Expo Go
- ✅ HomeScreen with stats and quick actions
- ✅ Express.js backend API (server.js, port 3001)
- ✅ API client (src/api.ts) with dev/prod URL switching
- ✅ Onboarding flow (5 steps: welcome, problems, apps, permissions, done)
- ✅ Website blocking screen (add/remove URLs, suggested sites)
- ✅ App.tsx checks onboarding state on launch

## What's Next
- ⏳ #4 Native Kotlin module skeleton (needs Android Studio)
- ⏳ #6 App blocking via foreground service
- ⏳ #18 Usage statistics dashboard
- ⏳ #20 Pomodoro timer

## Feature Progress
- Completed: 10/22 (Phase 0: foundation, UI, navigation + #5 app listing + #7 blocking overlay + #8 quick block + #12 onboarding + #11 website blocking)

## Blockers
- Android Studio not installed (~600MB, slow internet)

## User Preferences
- Wants same MD logic as MaurMaket
- Prefers VS Code over Android Studio
- Dark theme, minimal UI
- Uses Neon PostgreSQL for cloud DB
- Uses GitHub MCP for repo management

## Database
- **Neon Project:** PureBlock (long-base-77380238)
- **Tables:** users, profiles, blocked_apps, blocked_websites, schedules, block_sessions, blocked_attempts, user_settings, sync_queue
