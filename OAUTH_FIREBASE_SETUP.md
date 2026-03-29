# 🔐 Google OAuth & Firebase Setup Guide

## 📊 Architecture Overview

```
Frontend (Browser)
    ↓
User clicks "Continue with Google"
    ↓
Redirects to: http://localhost:5000/auth/google
    ↓
Backend (Node.js + Passport.js)
    ↓
Redirects to Google OAuth consent screen
    ↓
User approves
    ↓
Google redirects to: http://localhost:5000/auth/google/callback
    ↓
Backend finds/creates user in MongoDB
    ↓
Backend generates JWT token
    ↓
Redirects to Frontend with token in URL:
http://localhost:5173?token=xxx&user=yyy
    ↓
Frontend extracts token from URL
    ↓
Saves token to localStorage
    ↓
User logged in ✅
```

---

## 🔑 PART 1: Google OAuth Setup (5 minutes)

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Create Project"**
3. Name: `AI Student Hub`
4. Click **"Create"** and wait 1-2 minutes

### Step 2: Enable Google+ API

1. In Cloud Console, search for **"Google+ API"**
2. Click it and press **"Enable"**
3. Wait for it to enable (shows "API enabled" checkmark)

### Step 3: Create OAuth Credentials

1. Go to **Credentials** (left sidebar)
2. Click **"+ Create Credentials"** → **"OAuth client ID"**
3. If prompted: **"Create Consent Screen"** first:
   - User Type: **External**
   - App name: `AI Student Hub`
   - User support email: your email
   - Developer email: your email
   - Save and Continue → Scopes: Add `email` and `profile` → Save
4. Back to Create OAuth Credentials:
   - Application type: **Web application**
   - Name: `AI Student Hub Backend`
   - Authorized redirect URIs: Add:
     - `http://localhost:5000/auth/google/callback`
     - `https://yourdomain.com/auth/google/callback` (production)
   - Click **"Create"**

### Step 4: Copy Credentials

You'll see a popup with:
- **Client ID**
- **Client Secret**

Copy both values

### Step 5: Add to .env

In your `.env` file, replace:

```env
GOOGLE_CLIENT_ID=paste-your-client-id-here
GOOGLE_CLIENT_SECRET=paste-your-client-secret-here
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback
```

**Save `.env` file**

### Step 6: Test Backend OAuth

Start backend:
```bash
npm run dev
```

You should see:
```
✅ AI Student Hub Server started on port 5000
```

NOT:
```
Google OAuth not configured...
```

✅ **Google OAuth is now configured!**

---

## 🔥 PART 2: Firebase Setup (Optional - for Mobile/App Support)

### Why Firebase?

- Backend: Validates tokens, manages users in MongoDB
- Frontend (Web): Uses JWT tokens from backend
- Frontend (Mobile/App): Uses Firebase tokens for cross-platform support
- Firebase bridges web and mobile authentication

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"**
3. Name: `AI Student Hub`
4. Disable Analytics (optional)
5. Click **"Create project"** and wait 1-2 minutes

### Step 2: Enable Google Authentication

1. In Firebase, go to **Authentication** (left sidebar)
2. Click **"Get Started"**
3. Enable **"Google"** provider:
   - Click Google
   - Toggle **"Enable"**
   - Select your Google Cloud project
   - Click **"Save"**

✅ Google auth enabled in Firebase

### Step 3: Get Firebase Config (for Frontend)

1. In Firebase, click **"Project Settings"** (gear icon, top right)
2. Scroll to **"Your apps"** section
3. Click **"Web"** (or Add app → Web)
4. Copy the `firebaseConfig` object
5. Create `frontend/src/config/firebase.js`:

```javascript
// frontend/src/config/firebase.js
export const firebaseConfig = {
  apiKey: "paste-from-firebase-config",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};
```

### Step 4: Get Firebase Admin SDK (for Backend - Optional)

Only if you want backend to validate Firebase tokens:

1. In Firebase, go to **Project Settings** → **Service Accounts**
2. Click **"Generate New Private Key"**
3. Download JSON file
4. Copy values to `.env`:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=xxx
FIREBASE_PRIVATE_KEY=xxx
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@xxx.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=xxx
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
```

---

## 🌐 PART 3: Enable Google Login in Frontend

### Option A: Add Google Button to Signup/Login Page

Edit `frontend/src/pages/Login.jsx`:

```jsx
import GoogleLoginButton from '../components/GoogleLoginButton'

export default function Login() {
  return (
    <div>
      {/* ... existing form ... */}
      
      <div className="relative py-3">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/5"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-surface px-4 text-gray-500">Or</span>
        </div>
      </div>

      <GoogleLoginButton />
    </div>
  )
}
```

### Option B: Create Dedicated Google Login Page

Or use the hook directly:

```jsx
// frontend/src/pages/GoogleCallback.jsx
import { useOAuthCallback } from '../hooks/useOAuthCallback'

export default function GoogleCallback() {
  useOAuthCallback()
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4">Completing login...</p>
      </div>
    </div>
  )
}
```

Add to `frontend/src/App.jsx`:

```jsx
import GoogleCallback from './pages/GoogleCallback'

<Route path="/google-callback" element={<GoogleCallback />} />
```

---

## 🧪 PART 4: Test Google Login

### Without Frontend (Quick Test)

1. Backend running: `npm run dev`
2. Open browser: `http://localhost:5000/auth/google`
3. Should redirect to Google sign-in
4. After sign-in, redirects back with token in URL

### With Frontend

1. Both running:
   - Backend: `npm run dev`
   - Frontend: `cd frontend && npm run dev`

2. Go to: `http://localhost:5173/login`

3. Click **"Continue with Google"**

4. Sign in with Google account

5. Should redirect to dashboard ✅

---

## 🔗 Backend Routes Reference

| Route | Method | Purpose |
|-------|--------|---------|
| `/auth/google` | GET | Start OAuth flow |
| `/auth/google/callback` | GET | OAuth callback (auto-handled) |
| `/auth/google/user` | GET | Get current user (requires session) |
| `/auth/logout` | GET | Logout user |

---

## 💾 Database: User Model

Existing User model already supports Google OAuth:

```javascript
// models/User.js
{
  name: String,
  email: String,
  password: String,
  googleId: String,           // ✅ Already present
  provider: String,           // 'local' | 'google'
  accountStatus: String
}
```

When user signs in with Google:
- `googleId` is stored
- `provider` set to `'google'`
- Password is not needed (optional)

---

## 🚀 Production Deployment

### Vercel / Render

Update `.env` in production:

```env
GOOGLE_CLIENT_ID=your-production-client-id
GOOGLE_CLIENT_SECRET=your-production-secret
GOOGLE_CALLBACK_URL=https://your-domain.com/auth/google/callback
CORS_ORIGIN=https://your-frontend-domain.com
FRONTEND_URL=https://your-frontend-domain.com
```

Then re-deploy both backend and frontend.

---

## 🐛 Common Issues

| Issue | Fix |
|-------|-----|
| "Invalid redirect URI" | Update `GOOGLE_CALLBACK_URL` in both Google Cloud Console AND `.env` |
| "Signup not working" | Ensure existing `/api/users/create` route still works (backward compatible) |
| Token not saved | Check browser console for errors in `setAuthToken()` |
| "OAuth not configured" | Verify `.env` has GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET |
| Existing login broken | Google OAuth is separate route, existing email/password login still works |

---

## ✅ Verification Checklist

- [ ] Backup created: `ai-student-hub_backup_2026-03-29_*`
- [ ] Packages installed: `passport`, `passport-google-oauth20`, `express-session`
- [ ] `.env` updated with GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
- [ ] Backend starts without "OAuth not configured" warning
- [ ] `routes/authRoutes.js` created
- [ ] Frontend has `GoogleLoginButton.jsx`
- [ ] Frontend has `useOAuthCallback.js` hook
- [ ] Existing email/password signup still works
- [ ] Google login redirects to dashboard
- [ ] Token saved in localStorage

---

## 📚 Code Files Created/Modified

### Created:
- `routes/authRoutes.js` - New OAuth routes
- `config/firebase.js` - Firebase configuration helper
- `frontend/src/components/GoogleLoginButton.jsx` - Google button component
- `frontend/src/hooks/useOAuthCallback.js` - OAuth callback hook

### Modified:
- `server.js` - Added session, passport serialization, auth routes
- `.env` - Added Google OAuth and Firebase variables

### Preserved:
- `routes/UserRoutes.js` - Existing email/password signup still works
- `models/User.js` - Already has googleId field
- All other existing routes and functionality

---

## 🎯 What's Next?

1. **Mobile App Support**: Use `config/firebase.js` to validate Firebase tokens
2. **Account Linking**: Allow users to link multiple OAuth providers
3. **Social Login Analytics**: Track signup source (email vs Google)
4. **Admin Dashboard**: See which users used Google OAuth vs email

---

## ❓ Questions?

Check logs:
```bash
# Backend logs (in terminal running npm run dev)
✅ Google OAuth successful...
❌ Google OAuth error...

# Frontend logs (F12 → Console)
🔧 Development Mode - API: ...
📤 POST /auth/google
✅ OAuth successful
```

**Everything working? ✅ You're done!**
