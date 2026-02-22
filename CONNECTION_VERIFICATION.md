# 🔗 Connection Verification Checklist

## ✅ Quick Test

Open your browser and go to:
```
https://ai-student-hub-cwql.onrender.com
```

Then **open Browser Console** (Press F12):
- Look at the **Console** tab
- You should see:
  ```
  🚀 Production Mode - API: https://ai-student-hub-cwql.onrender.com/api
  ```

If you see this ✅ **Frontend is connected to Backend!**

---

## 🔍 Check If Backend API is Working

In browser, try this URL:
```
https://ai-student-hub-cwql.onrender.com/api/docs
```

You should see a JSON response with API information. If yes ✅ **Backend API is working!**

---

## 📋 Render Environment Variables Checklist

Go to: https://dashboard.render.com → Your Service → Environment

Check that these are set:

- [ ] `MONGO_URI` = Your MongoDB connection string
- [ ] `JWT_SECRET` = Any random secret (e.g., `my-secret-key-123`)
- [ ] `CORS_ORIGIN` = `https://ai-student-hub-cwql.onrender.com`
- [ ] `NODE_ENV` = `production`

If all are set ✅ **Environment variables are correct!**

---

## 🧪 Test Login/Signup

1. **Go to your website**: https://ai-student-hub-cwql.onrender.com
2. **Click "Sign up"**
3. **Create account** with:
   - Name: `Test User`
   - Email: `test@example.com`
   - Password: `password123`
4. **Open Console** (F12) and watch for:
   - 📤 Outgoing request to `/api/users/create`
   - ✅ Response with token

If you see these ✅ **Frontend-Backend connection is working!**

---

## ❌ If Something is Wrong

### Problem: Frontend shows but won't login
**Solution:**
1. Go to Render → Manual Deploy
2. Wait 5 minutes for redeploy
3. Try again

### Problem: "API is https://localhost" in console
**Solution:**
1. Check `.env.production` has correct URL
2. Rebuild frontend: `npm run build` in `frontend/`
3. Push to GitHub
4. Render will auto-redeploy

### Problem: "MongoDB Connection Failed"
**Solution:**
1. Check `MONGO_URI` environment variable on Render
2. Make sure MongoDB connection string is correct
3. Verify `<password>` is replaced in connection string

### Problem: CORS error
**Solution:**
1. Check `CORS_ORIGIN` on Render = `https://ai-student-hub-cwql.onrender.com`
2. Manual Deploy
3. Clear browser cache (Ctrl+Shift+Delete)
4. Try again

---

## 🚀 Local Testing (To Verify Everything Works)

If production isn't working, test locally first:

**Terminal 1 - Start Backend:**
```bash
npm start
# Should print:
# 🚀 AI Student Hub Server started on port 5000
# ✅ MongoDB Connected
```

**Terminal 2 - Start Frontend:**
```bash
cd frontend
npm run dev
# Should print:
# ✅ Local:   http://localhost:5173
```

**Then open**:
```
http://localhost:5173
```

Watch console for:
```
🔧 Development Mode - API: http://localhost:5000/api
```

If this works locally, then production should work too!

---

## 📞 What to Share if Still Stuck

If frontend-backend is still not connecting, please share:

1. **Console output** from browser (F12 → Console)
2. **Network errors** (F12 → Network tab)
3. **Render logs** (Render dashboard → Logs tab)
4. **What error message** you see

This will help debug faster!

---

## ✨ If Everything Works!

Congratulations! 🎉 Your full-stack app is connected!

Next steps:
1. **Connect tools** → Click "Tools" → Connect ChatGPT, GitHub, etc.
2. **Test dashboard** → Login and see your stats
3. **Share your app!** → Share the URL with friends

---

## Quick Summary

| Component | Status | URL |
|-----------|--------|-----|
| Frontend | ✅ Running | https://ai-student-hub-cwql.onrender.com |
| Backend API | ✅ Running | https://ai-student-hub-cwql.onrender.com/api |
| MongoDB | ✅ Connected | Set in MONGO_URI env var |
| CORS | ✅ Configured | CORS_ORIGIN environment variable |

All systems go! 🚀
