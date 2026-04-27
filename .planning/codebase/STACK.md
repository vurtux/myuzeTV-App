# Technology Stack

**Analysis Date:** 2026-04-06

## Languages

**Primary:**
- TypeScript ~5.9.2 - Used for app configuration, hooks, services, and routing
- JavaScript (ES6+) - Used for API modules, storage utilities, and utilities

**Secondary:**
- JSX/TSX - React component syntax across all components and screens

## Runtime

**Environment:**
- Node.js (latest) - Development and build environment
- React Native 0.81.5 - Cross-platform mobile framework
- Expo 54.0.33 - Build system and managed service for iOS/Android/Web

**Package Manager:**
- npm (Node Package Manager)
- Lockfile: package-lock.json (present)

## Frameworks

**Core:**
- expo-router 6.0.23 - File-based routing for iOS, Android, and Web (entry: `app/`)
- React 19.1.0 - UI library and hooks
- React Native 0.81.5 - Native components for mobile
- React DOM 19.1.0 - Web rendering

**Styling:**
- NativeWind 4.2.1 - Tailwind CSS for React Native and Web
- Tailwind CSS 3.4.19 - Utility-first CSS framework
- Global CSS custom properties - Dark theme defined in `global.css` (HSL-based colors)

**State Management:**
- TanStack React Query 5.90.21 - Server state, caching, and data fetching
- React Context - Local auth state (`context/AuthContext.tsx`)
- AsyncStorage / expo-secure-store - Client-side token persistence

**Testing:**
- Jest 30.3.0 - Unit test runner (preset: `jest-expo/web`)
- React Test Library 16.3.2 - Component testing utilities
- Testing Library React Native 13.3.3 - Native component testing
- Playwright 1.58.2 - E2E testing framework (config: `playwright.config.ts`)

**Build/Dev:**
- Babel - JavaScript transpiler (config: `babel.config.js`)
- Expo CLI - Native build tools and local dev server
- TypeScript - Static type checking

## Key Dependencies

**Critical:**
- @tanstack/react-query 5.90.21 - Manages API state and caching (dramas, rails, watchlist, continue-watching)
- axios 1.13.5 - HTTP client with request/response interceptors for auth tokens
- expo-router 6.0.23 - Handles navigation and deep linking across all platforms

**Firebase Integration:**
- firebase 12.9.0 - Web SDK for auth, analytics, and configuration
- @react-native-firebase/app 23.8.6 - Native Firebase app initialization
- @react-native-firebase/analytics 23.8.6 - Event tracking on iOS/Android
- @react-native-firebase/crashlytics 23.8.6 - Error reporting

**Analytics & User Engagement:**
- mixpanel-react-native 3.3.0 - Event tracking on mobile (native implementation)
- react-native-moengage 12.5.0 - Push notifications and user engagement on mobile
- react-native-expo-moengage 1.1.0 - Expo plugin wrapper for MoEngage

**Storage & Permissions:**
- expo-secure-store 15.0.8 - Secure token storage on iOS/Android
- @react-native-async-storage/async-storage 2.2.0 - Key-value storage on all platforms (web/mobile)

**Media & UI:**
- expo-av 16.0.8 - Audio/video playback primitives
- expo-image 3.0.11 - Optimized image handling for RN/Web
- @shopify/flash-list 2.2.2 - High-performance list rendering
- react-native-reanimated 4.1.1 - Smooth animations with worklets
- react-native-worklets 0.5.1 - Worklet runtime support for reanimated
- lucide-react-native 0.564.0 - Icon library
- react-native-svg 15.15.3 - SVG rendering support
- react-native-web 0.21.0 - React Native components on Web

**Native Utilities:**
- expo-device 7.0.2 - Device information (name, OS version, etc.)
- expo-application 6.0.2 - App version and Android ID
- expo-linking 8.0.11 - Deep linking and URL handling
- expo-status-bar 3.0.9 - Status bar styling
- react-native-safe-area-context 5.6.0 - Safe area handling on notched devices

## Configuration

**Environment:**
- `.env` file - Contains `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_CDN_URL`, `EXPO_PUBLIC_AUTH_TOKEN`
- `.env.example` - Template with default values
- `app.json` - Expo configuration (app name, icon, splash, iOS/Android plugins, Firebase, MoEngage)
- `babel.config.js` - NativeWind JSX import source + Babel plugins for reanimated/worklets
- `tsconfig.json` - TypeScript strict mode, path aliases (`@/*` points to project root)
- `playwright.config.ts` - E2E test configuration (Pixel 5 viewport, localhost:8082, parallel disabled)

**Build:**
- `package.json` scripts for all platforms:
  - `npm start` - Expo dev server (all platforms)
  - `npm run web` - Web dev server
  - `npm run build:web` - Export static build to `dist/`
  - `npm run build:deploy` - Build + inject auth token via `scripts/inject-config.js`

**Secrets Injection (Web Deploy):**
- `scripts/inject-config.js` - Extracts `EXPO_PUBLIC_AUTH_TOKEN` from `.env` and injects into `dist/config.js`
- Runtime access: `window.__MYUZE_AUTH_TOKEN__` (set by `config.js` on web)
- Used by `lib/auth-storage.js` to authenticate API requests without env vars

## Platform Requirements

**Development:**
- Node.js (latest LTS recommended)
- Xcode (for iOS development and testing)
- Android Studio (for Android emulator)
- Expo CLI (`npm start` or `npx expo`)

**Production:**
- **iOS:** iOS 13+
- **Android:** API level 21+ (Android 5.0+)
- **Web:** Static hosting (nginx, Vercel, Netlify, etc.) with EXPO_PUBLIC_AUTH_TOKEN injected at build time
- Firebase project configured for web, iOS, and Android
- MoEngage app configured with app ID `P571B1CH9BHEN2GUQTM75EZ1`

---

*Stack analysis: 2026-04-06*
