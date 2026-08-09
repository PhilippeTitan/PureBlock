# PureBlock — Project Context for AI Agents

## Overview
Porn addiction blocking Android app. React Native/Expo mobile app with a native Kotlin module for the blocking engine. Helps users block distracting apps, websites, and content on schedule.

## Tech Stack
- **Mobile:** React Native 0.85 + Expo SDK 56 + TypeScript
- **Native Module:** Kotlin (Android blocking engine)
- **Backend:** Express.js (optional, for sync/stats)
- **Database:** AsyncStorage (local) or SQLite
- **Navigation:** React Navigation 7 (bottom tabs + native stack)
- **State:** Custom reactive store
- **Styling:** StyleSheet, dark theme

## Project Structure
```
├── app.json               # Expo config
├── package.json           # Dependencies
├── App.tsx                # Root component
├── src/
│   ├── api.ts             # API client (if backend)
│   ├── store.ts           # Reactive state
│   ├── theme.ts           # Colors, spacing, fonts
│   ├── types.ts           # TypeScript interfaces
│   ├── navigation.ts      # Navigation types
│   ├── screens/
│   │   ├── HomeScreen.tsx
│   │   ├── BlockingScreen.tsx
│   │   ├── StatsScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   ├── ProfilesScreen.tsx
│   │   └── ScheduleScreen.tsx
│   └── components/
├── android/
│   └── app/src/main/
│       └── java/com/pureblock/
│           ├── blocking/       # Native Kotlin blocking engine
│           ├── accessibility/  # Accessibility service
│           └── deviceadmin/    # Device admin receiver
└── NOTES/                 # Session memory (like MaurMaket)
```

## Core Features (MVP)
1. **App Blocking** — Block selected apps by package name
2. **Website Blocking** — Block URLs via accessibility service
3. **Schedules** — Time-based blocking rules
4. **Profiles** — Multiple blocking configurations
5. **Quick Block** — Emergency one-tap blocking toggle
6. **Strict Mode** — Prevents disabling (device admin)
7. **Statistics** — Track blocked attempts, usage

## Blocking Architecture
- **React Native Layer:** UI, profiles, schedules, settings
- **Native Kotlin Module:** Accessibility service, device admin, actual blocking
- **Bridge:** React Native → Native via Turbo Modules or Native Modules

## Git Protocol
- **Always push after major changes**: After committing any significant feature, bug fix, or refactor, run `git push` immediately.

## Session Handoff Protocol
**At the START of every new session:**
1. Read `NOTES/context.md` for current state
2. If context.md is stale, back up the previous session:
   - Append session summary to `NOTES/sessions/source-of-truth.md`
   - Rewrite `NOTES/context.md` with current state
3. Check the opencode DB for recent user messages
4. You are now caught up — proceed with the user's request

## Blueprint Check Protocol
**After EVERY critical update (new feature, refactor, major change):**
1. Read `the blueprint to my porn addiction blocking app.txt` (AppBlock decompiled APK)
2. Search for key feature strings (blocking, schedule, profile, quick block, strict mode, pomodoro, mood, geofence, wifi, emergency, pin, onboarding, statistics)
3. Compare PureBlock's progress against AppBlock's features
4. Update this file's Feature Checklist with accurate statuses
5. Report gaps to user

**Why:** The blueprint is the source of truth for what AppBlock can do. We must stay aligned.

## Safety Rules
- **NEVER kill node.exe processes**: OpenCode runs on Node.js.
- **Always test on real device**: Blocking requires actual Android device/emulator with permissions.

## Obsidian Vault (Deep Context)
This project has a persistent knowledge base at `NOTES/`. Use it:

| File | Purpose | When to Read |
|------|---------|--------------|
| `context.md` | Lean active state (<5000 tokens) | **Every session start** |
| `design-principles.md` | UX rules, patterns | **Before ANY UI work** |
| `sessions/source-of-truth.md` | Immutable session log (append-only) | When you need full history |
| `decisions/` | Architecture Decision Records | When making design choices |

**Rules:**
- `source-of-truth.md` is **NEVER rewritten** — only appended to
- `context.md` is **rewritten each session** — keep lean, current state only

### Session Compaction Backup Protocol (MANDATORY)

**When:** At the START of every new session, or when a compaction occurs.

**Steps (in order):**
1. **Read** `context.md` to understand current state
2. **Read** last few user messages from previous session
3. **Append** to `sessions/source-of-truth.md`:
   ```
   ## Session N: [Title]
   **Date:** YYYY-MM-DD
   **Commits:** `hash`
   
   **What happened:**
   **What we built:**
   **What we fixed:**
   **Decision:**
   ```
4. **Rewrite** `context.md` with current state (lean, <5000 tokens)

## Dev Workflow
- **Frontend**: Expo Go on phone via LAN. Start with `npx expo start --clear`
- **Frontend IP**: Changes with network. Check `ipconfig` for current Wi-Fi IPv4.
- **Native Android**: Requires Android Studio for Kotlin module builds
- **Testing**: Real Android device required for blocking features

## MCP Integrations (OpenCode)
| MCP | Status | What It Does |
|-----|--------|--------------|
| **GitHub** | ✅ | Repo management, PRs, issues |
| **Supabase** | ✅ | Query DB directly (if using) |

## Design Principles
- **Dark theme by default** — blocking apps should feel calm, not alarming
- **Minimal UI** — focus on function, not flash
- **Clear status indicators** — user must always know what's blocked
- **Easy unblock** — but not TOO easy (strict mode exists for a reason)
- **Every screen MUST use safe areas** — use `useSafeAreaInsets()` on ALL screens. Top padding for headers, bottom padding for content below fold. Pattern: `paddingTop: insets.top`, `paddingBottom: insets.bottom + SPACING.lg`. ScreenHeader handles its own top safe area.

## Blocking Permissions Required
| Permission | Why |
|------------|-----|
| `PACKAGE_USAGE_STATS` | Detect which app is in foreground |
| `SYSTEM_ALERT_WINDOW` | Show blocking overlay |
| `BIND_ACCESSIBILITY_SERVICE` | Detect URLs in browsers |
| `BIND_DEVICE_ADMIN` | Prevent uninstall (strict mode) |
| `FOREGROUND_SERVICE` | Keep blocking alive in background |
| `QUERY_ALL_PACKAGES` | List installed apps |

## Feature Checklist (from AppBlock blueprint)

### 🔴 Phase 0: Foundation — 4 features
| # | Feature | Status | Description |
|---|---------|--------|-------------|
| 1 | Expo project setup | ✅ | React Native/Expo with TypeScript |
| 2 | Basic UI screens | ✅ | Home, Blocking, Stats, Settings with safe areas + headers |
| 3 | Navigation | ✅ | Bottom tabs + stack navigator |
| 4 | Native Kotlin module skeleton | ⏳ | Kotlin module for blocking engine (needs Android Studio) |

### 🟡 Phase 1: Core Blocking — 4 features
| # | Feature | Status | Description |
|---|---------|--------|-------------|
| 5 | App listing from device | ✅ | Get installed apps, show name/icon/package |
| 6 | App blocking via foreground service | ⏳ | Block apps by package name in background (needs native) |
| 7 | Blocking overlay screen | ✅ | Show screen when blocked app is opened |
| 8 | Quick block toggle | ✅ | One-tap emergency block/unblock button |

### 🟢 Phase 2: Profiles & Schedules — 4 features
| # | Feature | Status | Description |
|---|---------|--------|-------------|
| 9 | Multiple blocking profiles | ✅ | Work, Sleep, Study profiles with own blocked apps |
| 10 | Time-based schedules | ✅ | Day-of-week + start/end time per schedule |
| 11 | Website blocking | ✅ | Block URLs via accessibility service (schema ready) |
| 12 | Onboarding flow | ✅ | First-time setup wizard + permissions walkthrough |

### 🔵 Phase 3: Anti-Bypass — 4 features
| # | Feature | Status | Description |
|---|---------|--------|-------------|
| 13 | Strict mode (device admin) | ⏳ | Prevent uninstall, hard to disable (needs native) |
| 14 | PIN protection | ⏳ | PIN to change settings/disable blocking (settings only) |
| 15 | Emergency unlock codes | ❌ | Backdoor codes with limited uses |
| 16 | Location-based profiles | ❌ | Auto-activate profile by GPS geofence |

### ⚪ Phase 4: Analytics & Extras — 6 features
| # | Feature | Status | Description |
|---|---------|--------|-------------|
| 17 | Blocked attempts counter | ⏳ | Track per-app block counts (schema ready) |
| 18 | Usage statistics dashboard | ✅ | Daily/weekly/monthly reports |
| 19 | Motivational messages | ✅ | Quotes on blocking screen + daily notifications |
| 20 | Pomodoro timer | ❌ | Focus sessions with block during timer |
| 21 | Mood check-in | ❌ | Ask mood before/after blocking sessions |
| 22 | WiFi-based profiles | ❌ | Auto-activate by WiFi network |

### Summary
- **Total features:** 22
- **Completed:** 11 ✅
- **In Progress:** 6 ⏳
- **Not Built:** 5 ❌

## Key Observations
1. Native Kotlin module is REQUIRED for proper blocking
2. Accessibility service is the most powerful blocking method
3. Device admin prevents uninstall — use carefully
4. Test on real device always — emulators don't block well
5. Battery optimization can kill blocking service — need exemptions

---

## Session Log

### Session 1 — 2026-08-09 (Project Setup)
**Date:** 2026-08-09

**What happened:**
- Analyzed AppBlock decompiled APK to understand architecture
- Decided on Expo/React Native + Kotlin native module approach
- Set up initial project structure

**What we built:**
- Project folder structure
- Gradle build files (for reference)
- AndroidManifest.xml with required permissions
- Basic MainActivity with Compose (reference only)
- Theme files (Color, Theme, Type)
- AGENTS.md with full session protocol

**Decision:**
- Use Expo/React Native for UI (user already knows it)
- Write native Kotlin module for blocking engine
- Same MD logic as MaurMaket for infinite sessions

**Status:** Project scaffolded, ready for Expo setup

### Session 2 — 2026-08-09 (Expo Conversion + UI)
**Date:** 2026-08-09

**What happened:**
- Converted project from Kotlin/Gradle to Expo/React Native (user already knows stack from MaurMaket)
- Set up Expo 56 with TypeScript, React Navigation, SafeAreaProvider
- Created 6 screens: Home, Blocking, Stats, Settings, Profiles, Schedule
- Created ScreenHeader component for sticky headers
- Added safe areas to all screens
- Removed all hardcoded mock data, added empty states
- Fixed tab bar position and sticky headers

**What we built:**
- package.json, app.json, tsconfig.json (Expo config)
- App.tsx with bottom tabs + stack navigation
- src/theme.ts (COLORS, SPACING, FONTS)
- src/types.ts (TypeScript interfaces)
- src/components/ScreenHeader.tsx
- 6 screen files with safe areas + empty states
- NOTES/context.md + sessions/source-of-truth.md

**Decision:**
- Use Expo/React Native for UI, native Kotlin module for blocking engine
- Sticky headers: ScreenHeader outside ScrollView
- FlatList screens use ListHeaderComponent + ListEmptyComponent
- Dark theme with blue/teal/gold palette

**Status:** Foundation complete, ready for native module
