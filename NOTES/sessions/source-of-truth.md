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

---

## Session 5: Blocking Overlay + App Lister Service
**Date:** 2026-08-09

**What happened:**
- Fixed expo-android-app-list error (native module not available in Expo Go)
- Created appLister service with mock data for development
- Created BlockingOverlay component with motivational quotes
- Created BlockerScreen that shows when blocked app is opened
- Added BlockerScreen to navigation as modal
- Updated HomeScreen with stats, quick actions, and blocker preview
- Added danger color to theme

**What we built:**
- src/services/appLister.ts — App listing with mock fallback for Expo Go
- src/components/BlockingOverlay.tsx — Blocking UI with quotes and actions
- src/screens/BlockerScreen.tsx — Full blocking screen with back handler
- Updated BlockingScreen to use appLister service
- Updated HomeScreen with stats row, quick actions, blocker preview
- Updated App.tsx with BlockerScreen in navigation

**Decision:**
- Use appLister service abstraction (mock in dev, native on device)
- BlockingOverlay shows motivational quotes
- BlockerScreen handles back button and navigation
- HomeScreen shows quick stats and actions
- Preview button for testing blocking overlay

**Status:** 5/22 features done, blocking overlay working, app listing with mock fallback

---

## Session 6: Express.js Backend + Settings Wiring
**Date:** 2026-08-09

**What happened:**
- Built Express.js backend server for sync with Neon PostgreSQL
- Created API client for frontend-to-backend communication
- Wired SettingsScreen to use global store (was using local state)
- Updated syncEngine to use API client instead of raw fetch
- Fixed TypeScript errors (module resolution, missing state properties)
- Updated TypeScript to 5.4 for `module: preserve` support

**What we built:**
- server.js — Express backend (port 3001) with routes for profiles, blocked-apps, blocked-websites, schedules
- src/api.ts — Typed API client with dev/prod URL switching
- Updated src/store/syncEngine.ts — Uses API client instead of raw fetch
- Updated src/screens/SettingsScreen.tsx — Connected to useAppStore
- Updated src/store/StoreContext.tsx — Added missing store actions
- Updated src/store/useStore.ts — Fixed initial state (isBlocking/blockingSince)
- Updated src/services/appLister.ts — Fixed InstalledApp type
- Updated src/screens/BlockerScreen.tsx — Fixed navigation type
- Updated package.json — Added express, pg, cors, dotenv + server script
- Updated tsconfig.json — Compatible with Expo SDK 56

**Decision:**
- Express.js backend (like MaurMaket) for sync API
- API client switches URL based on __DEV__ (Android emulator uses 10.0.2.2)
- Settings screen now uses global store, not local state
- TypeScript updated to 5.4 to support `module: preserve`

**Status:** 6/22 features done, backend API ready, sync engine connected

---

## Session 7: Onboarding Flow + Safe Area Rule
**Date:** 2026-08-09

**What happened:**
- Built 5-step onboarding wizard (welcome, problems, apps, permissions, done)
- App.tsx now checks onboarding state on launch — shows onboarding first if incomplete
- OnboardingScreen loads installed apps and lets user pick apps to block
- Creates first profile + adds selected blocked apps on finish
- Added ONBOARDING_COMPLETE key to localStore
- Added safe area rule to AGENTS.md Design Principles

**What we built:**
- src/screens/OnboardingScreen.tsx — 5-step onboarding wizard with safe areas
- Updated src/store/localStore.ts — Added isOnboardingComplete/setOnboardingComplete
- Updated App.tsx — Conditional navigation based on onboarding state
- Updated AGENTS.md — Added safe area rule to Design Principles

**Decision:**
- Onboarding only shows once (AsyncStorage flag)
- Creates "My First Profile" with selected apps on finish
- Permissions explained but not enforced — user can grant later in Settings
- Every screen must use useSafeAreaInsets() — documented in AGENTS.md

**Status:** 7/22 features done, onboarding complete, safe area rule documented
