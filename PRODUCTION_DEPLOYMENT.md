# 🚀 Production Deployment Guide

**Project:** AI Student Hub + Gmail Integration  
**Status:** Ready for Production ✅

---

## 📋 Deployment Checklist

### Pre-Deployment (Local Verification)

- [ ] All backend routes tested and working
- [ ] Frontend builds without errors: `npm run build`
- [ ] Gmail endpoints respond correctly
- [ ] OAuth flow completes successfully
- [ ] Token refresh working automatically
- [ ] CORS properly configured
- [ ] No console errors in browser
- [ ] No unhandled exceptions in backend logs

### Environment Variables Ready

- [ ] `MONGO_URI` - Verified connection string
- [ ] `JWT_SECRET` - Generated strong secret (min 32 chars)
- [ ] `GOOGLE_CLIENT_ID` - From Google Console
- [ ] `GOOGLE_CLIENT_SECRET` - From Google Console
- [ ] `GOOGLE_CALLBACK_URL` - Will be `https://your-domain/auth/google/callback`
- [ ] `CORS_ORIGIN` - Will be frontend URL
- [ ] `FRONTEND_URL` - Frontend deployment URL

---

## 🔐 Google Cloud Console Setup (Prerequisites)

### Create Project
1. Go to https://console.cloud.google.com/
2. Create new project: "AI Student Hub"
3. Wait for project creation (30 seconds)

### Enable Gmail API
1. Search "Gmail API" in search bar
2. Click "Enable"
3. Agree to terms

### Enable Google+ API
1. Search "Google+ API"
2. Click "Enable"

### Create OAuth Credentials
1. Go to "Credentials" (left sidebar)
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Fill:
   - **Name:** AI Student Hub Web
   - **Authorized JavaScript origins:**
     - `http://localhost:5000` (dev)
     - `http://localhost:5173` (dev frontend)
     - `https://your-render-url` (production)
   - **Authorized redirect URIs:**
     - `http://localhost:5000/auth/google/callback` (dev)
     - `https://your-render-url/auth/google/callback` (production)

5. Click Create
6. Copy credentials shown in popup
   - Client ID: `...apps.googleusercontent.com`
   - Client Secret: `GOCSPX-...`

---

## 🚀 Backend Deployment (Render)

### Step 1: Prepare Repository

```bash
# Ensure all files committed
git status
git add .
git commit -m "Gmail integration complete - ready for production"
git push origin main
```

### Step 2: Create Render Account
1. Go to https://render.com
2. Sign up with GitHub
3. Authorize Render to access your repos

### Step 3: Create Web Service
1. Click "New" → "Web Service"
2. Select your GitHub repo
3. Configure:
   - **Name:** ai-student-hub
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start` or `node server.js`

### Step 4: Set Environment Variables
1. In Render dashboard, scroll to "Environment"
2. Add each variable:

```
MONGO_URI=mongodb+srv://obulajaswanthp_db_user:Thulasi-12@cluster0.fiuw1yx.mongodb.net/ai-student-hub?retryWrites=true&w=majority

JWT_SECRET=<generate-32-char-random-string>

GOOGLE_CLIENT_ID=<from-google-console>

GOOGLE_CLIENT_SECRET=<from-google-console>

GOOGLE_CALLBACK_URL=https://<your-render-url>.onrender.com/auth/google/callback

CORS_ORIGIN=https://<your-vercel-url>.vercel.app

FRONTEND_URL=https://<your-vercel-url>.vercel.app
```

3. Click "Deploy"
4. Wait 5-10 minutes for deployment

### Step 5: Verify Backend Deployment
```bash
# Test endpoint
curl https://your-render-url.onrender.com/api/gmail/status

# Should return 401 (no token) - that's normal ✅
```

---

## 🎨 Frontend Deployment (Vercel)

### Step 1: Prepare Frontend

```bash
cd frontend

# Install deps
npm install

# Build test
npm run build

# Should complete without errors ✅
```

### Step 2: Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub
3. Authorize Vercel

### Step 3: Import Project
1. Click "Import Project"
2. Select your GitHub repo
3. Configure:
   - **Project Name:** ai-student-hub-frontend
   - **Framework:** Vite
   - **Root Directory:** frontend

### Step 4: Set Environment Variables
1. In Vercel dashboard, go to "Settings" → "Environment Variables"
2. Add:

```
VITE_API_BASE=https://<your-render-url>.onrender.com/api
```

3. Click "Deploy"
4. Wait 2-3 minutes

### Step 5: Verify Frontend
1. Vercel gives you a URL: `https://...vercel.app`
2. Test: `https://...vercel.app/login`
3. Should load login page ✅

---

## 🔗 Update Google Console

### Add Production URLs

1. Go to https://console.cloud.google.com/
2. Go to "Credentials"
3. Edit the OAuth 2.0 Client ID for your web app
4. Add authorized origins:
   - `https://<your-vercel-url>.vercel.app`
5. Add authorized redirect URIs:
   - `https://<your-render-url>.onrender.com/auth/google/callback`
6. Save

---

## 🧪 Test Production Deployment

### Test Flow

1. Open browser: `https://your-vercel-url.vercel.app/login`
2. Click "Continue with Google"
3. Sign in with your Google account
4. Should redirect to dashboard ✅
5. Click "Gmail" in navbar
6. Should show your emails ✅

### If Issues Occur

```bash
# Check backend logs
# In Render: Dashboard → Logs

# Check frontend console
# Browser: F12 → Console tab

# Common issues:
- CORS error: Check CORS_ORIGIN in .env matches frontend URL
- OAuth error: Check GOOGLE_CLIENT_ID in Google Console
- Email error: Need to give Gmail API permission to app
```

---

## 📊 Production Monitoring

### Backend Monitoring
- Check Render logs: Dashboard → Logs
- Monitor for errors
- Track response times
- Watch for rate limits

### Frontend Monitoring
- Check Vercel logs: Analytics tab
- Monitor performance
- Track errors
- Watch user flow

---

## 🔒 Production Security Checklist

- [ ] JWT_SECRET is strong (32+ chars, mixed case, numbers)
- [ ] Never commit .env with real values
- [ ] Credentials only in platform (Render/Vercel secrets)
- [ ] HTTPS enabled on both services (automatic)
- [ ] MongoDB connection string from Atlas (IP whitelisted)
- [ ] Rate limiting enabled on auth routes
- [ ] CORS restricted to frontend domain only
- [ ] No sensitive logs in production
- [ ] Error messages generic (don't leak info)

---

## 📈 Post-Deployment

### Monitor First 24 Hours
- Check for errors
- Monitor response times
- Verify emails loading
- Test OAuth flow multiple times

### Regular Maintenance
- Update dependencies monthly
- Check MongoDB backups
- Review security logs
- Monitor API quotas

### Scale When Needed
- Render: Increase instance type
- Vercel: Already auto-scales
- MongoDB: Add indexes if needed

---

## 🎯 Final Checklist

### Before Going Live

✅ **Code:**
- [ ] All features tested locally
- [ ] No console errors
- [ ] No database errors
- [ ] Email fetching works

✅ **Configuration:**
- [ ] Google credentials generated
- [ ] Environment variables set
- [ ] CORS properly configured
- [ ] Redirect URIs updated

✅ **Deployment:**
- [ ] Backend deployed to Render
- [ ] Frontend deployed to Vercel
- [ ] Both services responding
- [ ] OAuth flow works end-to-end

✅ **Testing:**
- [ ] Can signup with email
- [ ] Can login with Google
- [ ] Can see emails
- [ ] Tokens auto-refresh

---

## 🚨 Emergency Procedures

### If Backend Goes Down
1. Check Render logs for errors
2. Redeploy from GitHub
3. Verify environment variables
4. Check MongoDB connection

### If Frontend Has Issues
1. Check Vercel logs
2. Clear cache: `npm run build`
3. Redeploy
4. Check API endpoint URL

### If OAuth Failing
1. Verify Google credentials not expired
2. Check redirect URI in Google Console matches exactly
3. Verify CORS_ORIGIN in backend
4. Check VITE_API_BASE in frontend

---

## 📞 Support

**File an issue if:**
- Deployment fails
- OAuth flow broken
- Emails not loading
- Performance issues

**Check logs if:**
- CORS errors (check CORS_ORIGIN)
- "Invalid redirect" (check Google Console)
- "Token expired" (normal, should auto-refresh)
- "Email API quota" (reduce maxResults)

---

## ✅ You're Production-Ready!

Once all checkboxes complete, your system is ready for users.

**Deployed URLs:**
- Backend: https://your-render-url.onrender.com
- Frontend: https://your-vercel-url.vercel.app

**Monitor dashboards:**
- Render: https://dashboard.render.com
- Vercel: https://vercel.com/dashboard

---

## 📚 Related Documentation
- See `GMAIL_INTEGRATION_COMPLETE.md` for feature overview
- See `.env.example` for configuration template
- See `OAUTH_FIREBASE_SETUP.md` for OAuth details
