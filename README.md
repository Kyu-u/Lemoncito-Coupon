# Lemoncito 🍋

A gamified lemon product app — play, earn coupons, shop.

---

## Quick Start (Test in browser)

```bash
npm install
npm run dev
```
Open http://localhost:5173

---

## Build for Production

```bash
npm install
npm run build
```
Output goes to the `dist/` folder.

---

## Convert to Android APK (Capacitor)

### Prerequisites
- Node.js 18+
- Android Studio + Android SDK installed
- Java 17+

### Steps

```bash
# 1. Build the web app
npm run build

# 2. Install Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/android

# 3. Initialize Capacitor (only once)
npx cap init "Lemoncito" "com.yourname.lemoncito" --web-dir dist

# 4. Add Android platform (only once)
npx cap add android

# 5. Sync your build to Android
npx cap sync android

# 6. Open Android Studio
npx cap open android
```

### In Android Studio
1. Wait for Gradle to finish syncing
2. Go to **Build → Build Bundle(s)/APK(s) → Build APK(s)**
3. Find your APK at: `android/app/build/outputs/apk/debug/app-debug.apk`

---
