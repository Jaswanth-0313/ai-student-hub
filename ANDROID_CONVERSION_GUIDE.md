# Android App Conversion Guide

## Using Capacitor for WebView Wrapper

### Step 1: Install Capacitor
```bash
cd frontend
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "AI Student Hub" "com.aistudenthub.app"
```

### Step 2: Add Android Platform
```bash
npx cap add android
```

### Step 3: Configure Capacitor
Edit `capacitor.config.ts`:
```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.aistudenthub.app',
  appName: 'AI Student Hub',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    url: 'https://ai-student-hub.web.app', // Your production frontend URL
    cleartext: true
  }
};

export default config;
```

### Step 4: Build and Sync
```bash
npm run build
npx cap sync android
```

### Step 5: Open in Android Studio
```bash
npx cap open android
```

### Step 6: Build APK
In Android Studio:
- Build > Build Bundle(s)/APK(s) > Build APK(s)
- Install on device or emulator

## Alternative: Trusted Web Activity (TWA)

Use Bubblewrap CLI for TWA:
```bash
npm install -g @bubblewrap/cli
bubblewrap init --manifest https://ai-student-hub.web.app/manifest.json
bubblewrap build
```

## Notes
- Ensure production frontend URL is used
- API calls work via HTTPS (no CORS issues)
- Login flow remains the same
- App will behave like a native app wrapper