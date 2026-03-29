# 🧪 Complete Testing Guide

**Project:** AI Student Hub + Gmail Integration  
**Purpose:** Verify all features work before production deployment

---

## 🚀 Quick Start Testing

### Setup (2 minutes)

```bash
# Terminal 1: Backend
cd c:\Users\Jaswanth12\OneDrive\Desktop\ai-student-hub
npm run dev

# Terminal 2: Frontend
cd c:\Users\Jaswanth12\OneDrive\Desktop\ai-student-hub\frontend
npm run dev

# Terminal 3: Testing
# (Optional) This guide uses curl or Postman for API tests
```

### Expected Output

**Backend:**
```
✓ dotenv: injecting env (17)
✓ Connecting to MongoDB...
✓ MongoDB Connected ✅
✓ 🚀 AI Student Hub Server started on port 5000
```

**Frontend:**
```
✓ VITE v5.4.21
✓ ready in 500 ms
✓ ➜  Local:   http://localhost:5173/
```

---

## ✅ Test 1: Basic Connectivity

### Frontend Can Reach Backend

**Browser Console (F12):**
```javascript
// Test API base URL
fetch('http://localhost:5000/api/gmail/status')
  .then(r => r.json())
  .then(d => console.log(d))

// Expected: 401 error (no JWT token) ✅
// Error type: "Unauthorized" is GOOD - means backend responds
```

**Terminal Test:**
```bash
curl -X GET http://localhost:5000/api/gmail/status

# Expected response:
# {"success":false,"message":"No authentication token provided"}
```

---

## ✅ Test 2: Email/Password Signup

### Create Test Account

**Via Postman or curl:**

```bash
curl -X POST http://localhost:5000/api/users/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Password123!"
  }'

# Expected response (201 Created):
# {
#   "message": "User created successfully",
#   "user": {
#     "_id": "...",
#     "name": "Test User",
#     "email": "test@example.com",
#     "provider": "local"
#   }
# }
```

### View in Browser

1. Open http://localhost:5173/login
2. Click "Sign Up" tab
3. Fill form:
   - Name: Test User
   - Email: test@example.com
   - Password: Password123!
4. Click "Sign Up"
5. Should see success message ✅

---

## ✅ Test 3: Email/Password Login

### Get JWT Token

```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!"
  }'

# Expected response (200 OK):
# {
#   "message": "Login successful",
#   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "user": {
#     "_id": "...",
#     "name": "Test User",
#     "email": "test@example.com"
#   }
# }
```

**Save JWT:** You'll use this token for protected endpoints
```bash
JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Via Browser

1. Open http://localhost:5173/login
2. Enter email: test@example.com
3. Enter password: Password123!
4. Click "Login"
5. Should redirect to dashboard ✅

---

## ✅ Test 4: Google OAuth Flow

### Prerequisites
1. Need Google OAuth credentials (from Google Console)
2. Update `.env` with:
   ```
   GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-secret
   GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback
   ```
3. Restart backend: `npm run dev`

### Test OAuth Login

1. Open http://localhost:5173/login
2. Click "Continue with Google"
3. Sign in with Google account
4. Should redirect to dashboard
5. Check in MongoDB:
   ```javascript
   // Run in MongoDB Atlas console
   db.users.findOne({ email: "your-google-email@gmail.com" })
   
   // Should show:
   // {
   //   provider: "google",
   //   googleId: "...",
   //   googleAccessToken: "ya29...",
   //   googleRefreshToken: "1//...",
   //   googleTokenExpiry: ISODate(...)
   // }
   ```

---

## ✅ Test 5: Gmail Connection Status

### Check If User Connected Gmail

```bash
# Use JWT from Test 3
JWT="your-jwt-token-here"

curl -X GET http://localhost:5000/api/gmail/status \
  -H "Authorization: Bearer $JWT"

# Response if NOT connected (email/password signup):
# {"success":false,"message":"Gmail not connected"}

# Response if CONNECTED (Google OAuth):
# {
#   "success": true,
#   "connected": true,
#   "email": "user@gmail.com",
#   "provider": "google",
#   "hasAccessToken": true,
#   "hasRefreshToken": true
# }
```

---

## ✅ Test 6: Fetch Emails (Gmail Users Only)

### Requires Google OAuth

```bash
# Use JWT from Google OAuth login
JWT="your-oauth-jwt-token"

curl -X GET "http://localhost:5000/api/gmail/emails?maxResults=5" \
  -H "Authorization: Bearer $JWT"

# Expected response (200 OK):
# {
#   "success": true,
#   "count": 5,
#   "emails": [
#     {
#       "id": "thread-id",
#       "threadId": "thread-id",
#       "from": "sender@email.com",
#       "subject": "Email subject",
#       "body": "Email body text",
#       "snippet": "Preview...",
#       "internalDate": "1711756800000"
#     }
#   ]
# }
```

### Via Browser

1. Login with Google
2. Go to http://localhost:5173/gmail
3. Should see email list ✅
4. Click email → See detail in modal ✅

---

## ✅ Test 7: Get Gmail Profile

```bash
# Get user's Gmail info
JWT="your-oauth-jwt-token"

curl -X GET http://localhost:5000/api/gmail/profile \
  -H "Authorization: Bearer $JWT"

# Expected response (200 OK):
# {
#   "success": true,
#   "profile": {
#     "emailAddress": "user@gmail.com",
#     "messagesTotal": 1234,
#     "threadsTotal": 456,
#     "historyId": "789123"
#   }
# }
```

---

## ✅ Test 8: Send Email (Gmail Users Only)

```bash
JWT="your-oauth-jwt-token"

curl -X POST http://localhost:5000/api/gmail/send \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "recipient@gmail.com",
    "subject": "Test Email",
    "message": "Hello! This is a test email from Gmail API."
  }'

# Expected response (200 OK):
# {
#   "success": true,
#   "message": "Email sent successfully",
#   "messageId": "19c0b1e..."
# }
```

### Verify Email Sent
- Check recipient's inbox
- Should arrive within seconds ✅

---

## ✅ Test 9: Token Refresh (Advanced)

### Simulate Token Expiration

```bash
# This tests automatic token refresh

# 1. Get initial token
JWT="your-oauth-jwt-token"

# 2. Gmail API calls work
curl -X GET http://localhost:5000/api/gmail/emails \
  -H "Authorization: Bearer $JWT"
# ✅ Works

# 3. Wait for access token to expire (or manually in future)
# - In real scenario: tokens expire after ~1 hour
# - Service automatically uses refresh token
# - New token saved to database

# 4. Next API call still works (with new token)
curl -X GET http://localhost:5000/api/gmail/emails \
  -H "Authorization: Bearer $JWT"
# ✅ Still works - token refreshed automatically
```

### Check Token Update in Database

```javascript
// MongoDB console
db.users.findOne({ email: "user@gmail.com" })

// googleAccessToken should be different from before
// (If you made multiple API calls after expiry)
```

---

## ✅ Test 10: Error Handling

### Test Invalid JWT

```bash
curl -X GET http://localhost:5000/api/gmail/status \
  -H "Authorization: Bearer invalid-token"

# Expected: 401 Unauthorized
# {
#   "success": false,
#   "message": "No authentication token provided"
# }
```

### Test Missing Authorization Header

```bash
curl -X GET http://localhost:5000/api/gmail/status

# Expected: 401 Unauthorized
```

### Test Non-Gmail User

```bash
# JWT from email/password signup
JWT="email-signup-jwt"

curl -X GET http://localhost:5000/api/gmail/emails \
  -H "Authorization: Bearer $JWT"

# Expected: 400 Bad Request
# {
#   "success": false,
#   "message": "Gmail not connected"
# }
```

---

## 🔄 Complete Test Sequence

### Full Flow Test (10 minutes)

1. **✅ Backend starts** - Check logs
2. **✅ Frontend starts** - Check browser
3. **✅ Signup with email** - Check database
4. **✅ Login with email** - Get JWT
5. **✅ Gmail status shows not connected** - Test endpoint
6. **✅ Google OAuth flow** - Complete signup with Google
7. **✅ Gmail status shows connected** - Test endpoint
8. **✅ Fetch emails** - See list in browser
9. **✅ Click email** - View detail in modal
10. **✅ Send test email** - Check recipient inbox

---

## 🐛 Debugging Tips

### Check Backend Logs

```bash
# Terminal running backend (npm run dev)
# Look for:
# - Connection messages: "MongoDB Connected ✅"
# - Request logs: "GET /api/gmail/emails"
# - Errors: "Error: Invalid token"
# - Gmail API: "Fetching emails..."
```

### Check Frontend Console

```javascript
// Browser F12 → Console tab
// Look for:
// - Network errors: "404 Not Found"
// - API responses: Success/failure
// - React warnings: Performance issues
```

### Check Network Tab

```
Browser F12 → Network tab
1. Login: POST to /api/users/login → 200 OK
2. Gmail status: GET to /api/gmail/status → 200 or 400
3. Fetch emails: GET to /api/gmail/emails → 200
```

### Check MongoDB

```javascript
// MongoDB Atlas console
db.users.find()
// Count users
db.users.countDocuments()
// Check specific user
db.users.findOne({ email: "test@example.com" })
```

---

## 📊 Test Checklist

### Pre-Testing
- [ ] Backend terminal running
- [ ] Frontend terminal running
- [ ] MongoDB connection verified
- [ ] .env file has all variables
- [ ] Ports 5000 and 5173 available

### Basic Tests
- [ ] Backend responds to requests
- [ ] Frontend loads without errors
- [ ] Email signup works
- [ ] Email login works
- [ ] JWT token generated

### Google OAuth Tests (Only if credentials set)
- [ ] Google login redirects correctly
- [ ] Token stored in database
- [ ] Gmail status shows connected
- [ ] Emails load successfully
- [ ] Email modal displays correctly

### API Tests
- [ ] /api/gmail/status responds
- [ ] /api/gmail/emails returns list
- [ ] /api/gmail/profile returns profile
- [ ] /api/gmail/send sends email
- [ ] Wrong token returns 401

### Error Tests
- [ ] Invalid JWT rejected
- [ ] Missing auth header rejected
- [ ] Non-Gmail user gets proper error
- [ ] Expired token auto-refreshes (Gmail users only)

---

## ✅ Success Criteria

**Testing Complete When:**

✅ All 10 test categories pass  
✅ No console errors in browser  
✅ No error logs in backend  
✅ MongoDB updates for each action  
✅ Gmail features work for OAuth users  
✅ Email/password features work for all users  

**You're ready to deploy when all checkboxes are checked!**

---

## 🚀 Next Steps

1. **Run through test checklist** (15 minutes)
2. **Fix any issues found** (depends on issues)
3. **Deploy to production** when all tests pass
4. **Monitor production** first 24 hours

---

## 📞 Common Issues During Testing

| Issue | Solution |
|-------|----------|
| "Cannot GET /api/gmail/emails" | Backend not running or route not mounted |
| "CORS error in console" | Check CORS_ORIGIN in .env |
| "JWT is not defined" | Copy JWT token from login response |
| "Gmail not connected" | User didn't sign up with Google OAuth |
| "Unauthorized (401)" | JWT invalid or missing Authorization header |
| "ModuleNotFoundError" | Run `npm install` in project root |
| "Cannot find port 5000/5173" | Port already in use, kill process or use different port |

---

## 📝 Test Report Template

```markdown
# Test Report - [DATE]

## Backend
- [ ] Starts without errors
- [ ] Connects to MongoDB
- [ ] All routes respond

## Frontend  
- [ ] Builds without errors
- [ ] Loads at localhost:5173
- [ ] No console errors

## Authentication
- [ ] Email signup works
- [ ] Email login works
- [ ] Google OAuth works (if credentials set)

## Gmail Features (OAuth users)
- [ ] Status check works
- [ ] Email list loads
- [ ] Email detail modal works
- [ ] Send email works

## Issues Found
- ... (list any issues)

## Ready for Deployment
- [ ] YES (all tests pass)
- [ ] NO (issues to fix first)
```

