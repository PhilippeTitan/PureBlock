# PureBlock — Active Context

## Current State
Offline-first local storage layer complete. 6 screens wired to real store. Neon PostgreSQL schema applied. GitHub repo created.

## Last Session
- **Date:** 2026-08-09
- **Focus:** Storage layer, Neon migration, GitHub setup
- **Status:** Complete

## What's Done
- ✅ Analyzed AppBlock decompiled APK
- ✅ Decided on tech stack (Expo + Kotlin native)
- ✅ Created Expo project with TypeScript
- ✅ 6 screens with safe areas + sticky headers
- ✅ ScreenHeader component
- ✅ Navigation (tabs + stack)
- ✅ Dark theme (blue/teal/gold)
- ✅ AGENTS.md with 22 features tracked
- ✅ Neon PostgreSQL schema (9 tables, migration applied)
- ✅ Offline-first local storage (AsyncStorage)
- ✅ Sync engine (local ↔ Neon)
- ✅ Store context (useAppStore hook)
- ✅ Screens wired to real data (Profiles, Blocking, Schedule)
- ✅ GitHub repo: https://github.com/PhilippeTitan/PureBlock
- ✅ Utility functions (ID generation, time helpers)

## What's Next
- ⏳ #4 Native Kotlin module skeleton (needs Android Studio)
- ⏳ #5 App listing from device
- ⏳ #6 App blocking via foreground service
- ⏳ #7 Blocking overlay screen
- ⏳ Build Express.js backend API for sync
- ⏳ Wire up Settings screen to store

## Feature Progress
- Completed: 3/22 (Phase 0: foundation, UI, navigation)
- In Progress: Offline storage + sync layer
- Next: Native Kotlin module (Phase 0, #4)

## Blockers
- Android Studio not installed (~600MB, slow internet)
- Backend API not built yet (needed for sync)

## User Preferences
- Wants same MD logic as MaurMaket
- Prefers VS Code over Android Studio
- Dark theme, minimal UI
- Uses Neon PostgreSQL for cloud DB
- Uses GitHub MCP for repo management

## Database
- **Neon Project:** PureBlock (long-base-77380238)
- **Tables:** users, profiles, blocked_apps, blocked_websites, schedules, block_sessions, blocked_attempts, user_settings, sync_queue
