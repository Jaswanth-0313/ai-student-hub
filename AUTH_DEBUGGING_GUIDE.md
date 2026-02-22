# Authentication Debugging Guide

## ✅ Fixed Issues

### 1. **Auto-Login After Signup**
- **Problem**: User had to manually navigate to login after signup
- **Solution**: Backend now returns JWT token immediately after signup, frontend auto-logs in
- **Result**: After signup, user is automatically logged in and redirected to dashboard

### 2. **Enhanced Error Logging**
- **Added request interceptor**: Logs all API calls (📤 method, URL, data)
- **Added response interceptor**: Logs success (✅) and errors (❌) with status and message
- **Better error messages**: Browser console now shows detailed error info

### 3. **Input Validation**
- Backend validates that name, email, password are provided
- More specific error messages for missing fields

### 4. **Better Error Handling**
- Frontend catches and logs errors with full context
- Console shows: Request info, Response data, Error messages

---

## 🔍 How to Debug

### Open Browser Console
1. In your browser, press **F12** or **Ctrl+Shift+I** → Go to **Console** tab
2. You'll see color-coded logs:
   - 🔧 Development Mode - API URL
   - 🔐 Auth token set/cleared
   - 📤 Outgoing requests (method, URL, data)
   - ✅ Successful responses (status, URL, response data)
   - ❌ Errors (status, message, full error)

### Common Issues & Solutions

#### **"User not found" error**
```
❌ Response Error: { status: 400, message: "User not found", url: "/api/users/login" }
```
✅ **Solution**: Make sure you've signed up first. Try signing up with a new email.

#### **"Invalid credentials" error**
```
❌ Response Error: { status: 400, message: "Invalid credentials", url: "/api/users/login" }
```
✅ **Solution**: Check that password matches what you signed up with. Passwords are case-sensitive.

#### **"Email already registered" error**
```
❌ Response Error: { status: 400, message: "Email already registered", url: "/api/users/create" }
```
✅ **Solution**: Use a different email or login with existing account.

#### **401 Unauthorized error**
```
❌ Response Error: { status: 401, message: "Invalid token", url: "/api/dashboard" }
```
✅ **Solutions**:
   1. Check browser console: `localStorage.getItem('token')` - token should exist
   2. Verify token starts with correct format (long string)
   3. Clear localStorage and login again: `localStorage.clear()`
   4. Check backend JWT_SECRET is set (especially on Render)

#### **CORS error (blocked by browser)**
```
Access to XMLHttpRequest at 'https://...' from origin 'https://...' has been blocked by CORS policy
```
✅ **Solution**: 
   1. Verify backend CORS_ORIGIN environment variable matches frontend URL
   2. For Render: Set `CORS_ORIGIN=https://ai-student-hub-cwql.onrender.com`
   3. For local dev: Set `CORS_ORIGIN=http://localhost:5173` (Vite port)

---

## 🧪 Testing Checklist

### Local Development
```bash
# Terminal 1: Start backend
npm start

# Terminal 2: Start frontend
cd frontend
npm run dev
```

Then test:
- [ ] **Signup**: Create new account, watch console for logs
- [ ] **Login**: Verify token in localStorage with `localStorage.getItem('token')`
- [ ] **Auth token in requests**: Check Network tab → click login request → Headers → see Authorization header
- [ ] **Dashboard loads**: After login, dashboard should show

### Console Checks
```javascript
// Check token
localStorage.getItem('token')
// Should return a long JWT string, NOT null

// Check axios headers
// Look for: Authorization: Bearer <token>
```

---

## 📊 Network Tab Debugging

1. Open **DevTools** → **Network** tab
2. Perform login/signup
3. Click the request (e.g., `/api/users/login`)
4. Check:
   - **General**: Status should be 200 (success) or 400 (user error)
   - **Request Headers**: `Authorization: Bearer {token}` should be present
   - **Response**: Should contain `{ token: "...", user: {...} }`

---

## 🚀 Production Debugging (Render)

If issues after deploying to Render:

1. **Check Render logs**: Go to Render dashboard → Select web service → Logs tab
2. **Set environment variables**: 
   ```
   MONGO_URI=<your-mongodb-url>
   JWT_SECRET=<generate-strong-secret>
   CORS_ORIGIN=https://ai-student-hub-cwql.onrender.com
   NODE_ENV=production
   ```
3. **Redeploy**: Push new code to GitHub or click "Manual Deploy" in Render

---

## ✍️ Quick Troubleshooting Steps

**If login/signup still fails:**

1. Open browser **Console** (F12)
2. Note the exact error message shown
3. Check **Network** tab for:
   - Request URL
   - Response status
   - Response body (error message)
4. Verify:
   - Backend is running (`npm start`)
   - MongoDB connection works
   - JWT_SECRET is set
   - CORS_ORIGIN is correct

Send the error from console + network details for specific help!
