# PureBlock — Session Log (Source of Truth)

> This file is append-only. Never rewrite existing entries.

---

## Session 1: Project Setup
**Date:** 2026-08-09

**What happened:**
- User asked to study AppBlock decompiled APK
- Analyzed the blueprint file (decompiled APK output)
- Identified key features: app blocking, website blocking, schedules, profiles, strict mode, statistics
- Decided on Expo/React Native + Kotlin native module approach
- Set up initial project structure with Gradle files, AndroidManifest, themes

**What we built:**
- Project folder structure
- Gradle build files (reference only, will be replaced by Expo)
- AndroidManifest.xml with required permissions
- Theme files (Color.kt, Theme.kt, Type.kt)
- AGENTS.md with full session protocol
- NOTES/context.md for session handoff

**Decision:**
- Use Expo/React Native for UI (user already knows it from MaurMaket)
- Write native Kotlin module for blocking engine
- Same MD logic as MaurMaket for infinite sessions
- User prefers VS Code, doesn't want to download Android Studio

**Status:** Project scaffolded, ready for Expo conversion

---

## Session 2: Expo Conversion + UI Polish
**Date:** 2026-08-09

**What happened:**
- Converted from Kotlin/Gradle to Expo/React Native (user knows MaurMaket stack)
- npm install fixed dependency conflicts (React 19.2.3, @types/react 19.2.0)
- Created placeholder icon/splash assets for Expo to run
- Added safe areas (useSafeAreaInsets) to all 6 screens
- Created ScreenHeader component for sticky headers
- Removed all hardcoded mock data from every screen
- Added empty states with icons, titles, descriptions
- Fixed sticky headers (header outside ScrollView pattern)
- Tracked 22 features in AGENTS.md with phases + status

**What we built:**
- package.json (Expo 56, React 19, React Native 0.85.3)
- App.tsx (bottom tabs + stack navigator)
- src/theme.ts, src/types.ts
- src/components/ScreenHeader.tsx
- 6 screens: Home, Blocking, Stats, Settings, Profiles, Schedule
- assets/ (icon, splash, adaptive-icon, favicon)
- NOTES/context.md, NOTES/sessions/source-of-truth.md

**Decision:**
- Header outside ScrollView for sticky effect
- FlatList screens use ListHeaderComponent + ListEmptyComponent
- Tab bar height 70px, no default header
- ScreenHeader handles its own safe area padding

**Status:** Foundation complete, 3/22 features done, ready for native module

---

## Session 3: Offline Storage + Database + GitHub
**Date:** 2026-08-09

**What happened:**
- User requested GitHub repo creation for PureBlock
- Created private repo at https://github.com/PhilippeTitan/PureBlock
- Initialized git, committed initial codebase, pushed to main
- Completed Neon PostgreSQL migration (9 tables applied to main branch)
- Built offline-first local storage layer with AsyncStorage
- Created sync engine for local ↔ Neon sync
- Created StoreContext with useAppStore hook
- Wired ProfilesScreen, BlockingScreen, ScheduleScreen to real store
- Updated types.ts to match store implementation
- Installed expo-network for online detection

**What we built:**
- GitHub repo: https://github.com/PhilippeTitan/PureBlock
- src/store/localStore.ts — AsyncStorage wrapper (CRUD for all entities)
- src/store/syncEngine.ts — Push/pull sync with Neon backend
- src/store/useStore.ts — Reactive store hook with all actions
- src/store/StoreContext.tsx — React context provider
- src/utils.ts — ID generation, time helpers, schedule utils
- Updated App.tsx with StoreProvider wrapper
- Updated ProfilesScreen with real data + add/delete
- Updated BlockingScreen with real data + remove
- Updated ScheduleScreen with real data + delete
- Updated types.ts (BlockedApp, BlockedWebsite, Profile, Schedule, Settings)

**Decision:**
- Use AsyncStorage for offline-first (local reads, background sync)
- Sync engine pushes to Neon when online, queues when offline
- StoreContext provides global state to all screens
- Each screen handles its own CRUD operations
- Backend API URL left empty (to be built later)

**Status:** Offline storage layer complete, 3/22 features done, screens wired to real data

---

## Session 4: App Listing Feature
**Date:** 2026-08-09

**What happened:**
- User requested GitHub repo creation for PureBlock
- Created private repo at https://github.com/PhilippeTitan/PureBlock
- Initialized git, committed initial codebase, pushed to main
- Completed Neon PostgreSQL migration (9 tables applied to main branch)
- Built offline-first local storage layer with AsyncStorage
- Created sync engine for local ↔ Neon sync
- Created StoreContext with useAppStore hook
- Wired ProfilesScreen, BlockingScreen, ScheduleScreen to real store
- Installed expo-android-app-list for listing installed apps
- Built app picker modal in BlockingScreen

**What we built:**
- GitHub repo: https://github.com/PhilippeTitan/PureBlock
- src/store/localStore.ts — AsyncStorage wrapper (CRUD for all entities)
- src/store/syncEngine.ts — Push/pull sync with Neon backend
- src/store/useStore.ts — Reactive store hook with all actions
- src/store/StoreContext.tsx — React context provider
- src/utils.ts — ID generation, time helpers, schedule utils
- Updated App.tsx with StoreProvider wrapper
- Updated ProfilesScreen with real data + add/delete
- Updated BlockingScreen with real data + remove + app picker modal
- Updated ScheduleScreen with real data + delete
- Updated types.ts (BlockedApp, BlockedWebsite, Profile, Schedule, Settings)
- Added danger color to theme.ts

**Decision:**
- Use AsyncStorage for offline-first (local reads, background sync)
- Sync engine pushes to Neon when online, queues when offline
- StoreContext provides global state to all screens
- Each screen handles its own CRUD operations
- Backend API URL left empty (to be built later)
- Use expo-android-app-list for listing installed apps (no native module needed)
- App picker modal for selecting apps to block

**Status:** Offline storage layer complete, 4/22 features done, app listing working
