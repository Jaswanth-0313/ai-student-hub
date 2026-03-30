# Phase 2 Testing & Validation Guide

## Overview
This document outlines all testing scenarios for the production-safe authentication and tool connection system.

---

## 1. Google Login - Popup Fallback (CRITICAL)

### Test Case 1.1: Google Popup Success
**Scenario**: User logs in with Google popup (normal scenario)
- Navigate to Login page
- Click "Continue with Google"
- Google login popup appears
- Login with test account
- **Expected**: 
  - Redirect to Dashboard
  - Firebase token set (check X-Firebase-Token header in DevTools)
  - User data synced to backend
  - ✅ PASS: Can access tools page

### Test Case 1.2: Google Popup Blocked (KEY TEST)
**Scenario**: Browser blocks popup, fallback to redirect
- Open DevTools > Settings > Block popups
- Navigate to Login page
- Click "Continue with Google"
- Browser blocks popup
- **Expected**:
  - No error shown immediately
  - Redirect to Google login page happens
  - After Google auth completes, redirect back to app
  - Lands on Dashboard
  - ✅ PASS: Successfully logged in

### Test Case 1.3: Google Redirect Result Handling
**Scenario**: User returns from Google redirect on app mount
- User logs in via redirect flow
- App detects redirect result on mount via `getRedirectResult()`
- **Expected**:
  - User synced with backend
  - Auth context updated
  - Navigates to Dashboard automatically
  - ✅ PASS: No manual redirect needed

---

## 2. Provider Detection - Credential Mixing (CRITICAL)

### Test Case 2.1: Google-Only Account Password Login Rejection
**Scenario**: User tries password login with Google-only account
- Sign up with Google (test1@gmail.com)
- Logout
- Go to Login page
- Enter test1@gmail.com + any password
- Click Login
- **Expected**:
  - Error message: "This account uses Google login. Please continue with Google instead."
  - Password is NOT checked against any stored hash
  - ✅ PASS: Prevents credential mixing

### Test Case 2.2: Password Account Normal Login
**Scenario**: User signs up with password, logs in with password
- Sign up with test2@gmail.com + password
- Logout
- Login with test2@gmail.com + correct password
- **Expected**:
  - Login succeeds
  - Redirect to Dashboard
  - ✅ PASS: Password login works

### Test Case 2.3: Password Account Password + Google Rejection
**Scenario**: User with password account tries Google login
- Sign up with password (test3@gmail.com)
- Logout
- Try "Continue with Google" with same email
- **Expected**:
  - Firebase rejects (not a Google account)
  - OR app shows: "This is a password account. Please use password login."
  - ✅ PASS: Clear separation

---

## 3. Tool Connection - Resource Links & Modal (CRITICAL)

### Test Case 3.1: Modal Shows Resource Links
**Scenario**: User connects a tool with API key requirement
- Login via Google
- Go to Tools page
- Click "Connect" on ChatGPT
- Modal opens
- **Expected**:
  - "Open Website" button → https://chat.openai.com
  - "Get Credentials" button → https://platform.openai.com/api-keys
  - API Key input field visible
  - "Your credentials are encrypted..." message shown
  - "Once connected, stored securely..." message shown
  - ✅ PASS: User knows where to get API key

### Test Case 3.2: Tool Without API Key (Gmail)
**Scenario**: Connect tool that doesn't require API key
- Click "Connect" on Gmail
- Modal opens
- **Expected**:
  - "Open Website" and "Get Credentials" buttons present
  - NO input field (credentialType = 'none')
  - Message: "Simply log in with your Gmail account when you click 'Open'"
  - "Connect" button ready to click
  - ✅ PASS: No unnecessary input

### Test Case 3.3: API Key Validation
**Scenario**: Enter empty API key
- Modal open for ChatGPT
- Leave API Key field empty
- Click "Connect"
- **Expected**:
  - Error: "OpenAI API Key is required"
  - Modal stays open
  - No API call made
  - ✅ PASS: Validation works

### Test Case 3.4: API Key Input Type (Password Field)
**Scenario**: Enter API key value
- Modal open for ChatGPT
- Type in API Key field
- **Expected**:
  - Input field type = "password"
  - Text is masked (dots instead of chars)
  - ✅ PASS: Security

---

## 4. API Key Persistence (CRITICAL)

### Test Case 4.1: Connect Tool - API Key Stored
**Scenario**: Connect ChatGPT with valid API key
- Modal open for ChatGPT
- Enter valid OpenAI API key
- Click "Connect"
- **Expected**:
  - Loading spinner shows "Connecting..."
  - Modal closes
  - Tools list reloads
  - ChatGPT shows "Open" button (connected state)
  - No input prompt on subsequent page loads
  - ✅ PASS: API key persisted

### Test Case 4.2: No Re-prompt After Refresh
**Scenario**: Refresh page after connecting tool
- Connected ChatGPT in previous test
- Refresh page (F5)
- **Expected**:
  - Tools load via api.get('/tools')
  - ChatGPT shows connected state immediately
  - No "Connect" modal appears
  - API key NOT requested again
  - ✅ PASS: Persistence verified

### Test Case 4.3: Multi-Device Persistence
**Scenario**: Open app on different device
- Connect ChatGPT on Device A
- Open app on Device B (different browser/device)
- Login with same account
- Go to Tools
- **Expected**:
  - ChatGPT shows as connected on Device B
  - Device B queries backend, gets userId's tools
  - Backend returns ChatGPT in connected state
  - ✅ PASS: Synced across devices

---

## 5. Tool Disconnection - Credential Removal

### Test Case 5.1: Disconnect Tool Confirmation
**Scenario**: Disconnect a connected tool
- ChatGPT is connected
- Click "Disconnect" button
- **Expected**:
  - Confirmation dialog: "Are you sure you want to disconnect ChatGPT? Your stored API key will be removed."
  - Two options: Cancel, OK
  - ✅ PASS: User warned

### Test Case 5.2: Confirm Disconnection
**Scenario**: Click OK on confirmation
- Confirmation dialog shown
- Click OK
- **Expected**:
  - "Disconnecting..." state shown
  - DELETE /tools/disconnect/chatgpt sent
  - ChatGPT removed from database
  - Button changes to "Connect"
  - API key completely deleted (not just disabled)
  - ✅ PASS: Credentials cleared

### Test Case 5.3: Re-Connect After Disconnect
**Scenario**: Connect tool again after disconnection
- ChatGPT disconnected
- Click "Connect" on ChatGPT
- Modal appears
- Enter API key
- Click "Connect"
- **Expected**:
  - New API key stored (different from original)
  - Tool connected again
  - ✅ PASS: Can reconnect with new key

---

## 6. Gmail Account Consistency

### Test Case 6.1: Gmail Opens with Logged-in Email
**Scenario**: Open Gmail tool
- Login with test@gmail.com
- Go to Tools, connect Gmail (no credentials needed)
- Click "Open" on Gmail
- **Expected**:
  - Gmail opens in new tab
  - Gmail is logged in as test@gmail.com
  - Shows URL with authuser=test@gmail.com hint
  - User doesn't see different account's Gmail
  - ✅ PASS: Correct account used

### Test Case 6.2: Multi-Account Gmail Check
**Scenario**: Browser has multiple Gmail accounts logged in
- Login to app with user1@gmail.com
- In browser, also logged in as user2@gmail.com
- Open Gmail from app
- **Expected**:
  - Gmail redirects to user1@gmail.com (via authuser hint)
  - user1's inbox shown, not user2's
  - ✅ PASS: App account takes priority

---

## 7. Firebase ID Token in API Calls

### Test Case 7.1: ID Token Included in Tool Requests
**Scenario**: Connect and use a tool
- Any tool connected
- Open DevTools > Network
- Tool action triggered (e.g., Open button)
- **Expected**:
  - Request headers include: `X-Firebase-Token: <long-jwt-string>`
  - Backend receives token, validates with Firebase
  - Prevents credential leakage to wrong user
  - ✅ PASS: ID token present

---

## 8. Multi-Device Session Handling

### Test Case 8.1: Device Isolation - User A on Device 1
**Scenario**: User A logs in on Device 1
- Login as userA@gmail.com
- Go to Tools
- Connect ChatGPT with key-A
- **Expected**:
  - Backend stores: userId=userA, tool=chatgpt, apiKey=key-A
  - Querygetted all userA's tools
  - ✅ PASS: Data isolated

### Test Case 8.2: Device Isolation - User B on Device 2
**Scenario**: User B logs in on Device 2 (same or different device)
- Login as userB@gmail.com
- Go to Tools
- **Expected**:
  - Backend returns userB's tools (NOT userA's)
  - userB does NOT see userA's connected ChatGPT
  - Each userId has isolated tool list
  - ✅ PASS: No data leakage

### Test Case 8.3: Same User, Multiple Devices
**Scenario**: userA logs in on Device 1, Device 2, Device 3
- Connect ChatGPT on Device 1
- Open Device 2, login as userA
- **Expected**:
  - Device 2 shows ChatGPT as connected (synced)
  - Device 3 also shows ChatGPT connected
  - All devices see same userId's tools
  - ✅ PASS: Cross-device sync works

---

## 9. UI States & Interactions

### Test Case 9.1: Button Disabled During Loading
**Scenario**: Click Connect button
- Click "Connect" on a tool
- Modal appears
- **Expected**:
  - "Connect" button shows spinner
  - Button becomes disabled (grayed out)
  - Can't click again during loading
  - After success, button re-enables
  - ✅ PASS: No double-requests

### Test Case 9.2: Error Handling in Modal
**Scenario**: Invalid API key
- Connect tool with intentionally wrong API key
- Server returns error
- **Expected**:
  - Error message displayed below input
  - Modal stays open (not dismissed)
  - User can correct and retry
  - ✅ PASS: Clear error feedback

### Test Case 9.3: Error Clearing on Disconnect
**Scenario**: Show error, then disconnect tool
- Any error displayed at top of page
- Click "Disconnect" on any tool
- Confirm disconnection
- **Expected**:
  - After successful disconnect, error is cleared
  - Fresh state
  - ✅ PASS: Error doesn't persist

---

## 10. Forgot Password Flow

### Test Case 10.1: Forgot Password Basic
**Scenario**: Forgotten password
- Click "Forgot password?" on Login
- Enter email
- **Expected**:
  - Email sent with reset token
  - User can set new password
  - Can login with new password
  - ✅ PASS: Password recovery works

---

## 11. Cross-Browser & Error Scenarios

### Test Case 11.1: Browser Compatibility
**Scenarios**: Test on multiple browsers:
1. Chrome/Chromium
2. Firefox
3. Safari
4. Edge

- Each browser: signup, login, connect tool, disconnect, logout
- **Expected**: All actions work, no JS errors
- ✅ PASS: Cross-browser compatible

### Test Case 11.2: Network Error Handling
**Scenario**: Simulate network failure
- Connect tool, but API is down
- **Expected**:
  - Error caught and user notified
  - "Failed to connect..." message shown
  - Modal doesn't close
  - User can retry
  - ✅ PASS: Graceful failure

### Test Case 11.3: Missing Auth Token
**Scenario**: API call without Firebase ID token
- Manually remove X-Firebase-Token header (DevTools)
- Try tool action
- **Expected**:
  - Server rejects request (401 or 403)
  - Error message shown to user
  - ✅ PASS: Security enforced

---

## 12. Logout & Session Cleanup

### Test Case 12.1: Logout Clears Session
**Scenario**: Login, then logout
- Login with any provider
- Click Logout
- **Expected**:
  - Firebase session cleared
  - JWT token cleared from localStorage
  - X-Firebase-Token cleared from headers
  - Redirect to Login page
  - ✅ PASS: Complete cleanup

### Test Case 12.2: Disabled Buttons After Logout
**Scenario**: After logout, try accessing dashboard
- Logout
- Try navigating to /dashboard directly
- **Expected**:
  - Redirect to Login (not allowed)
  - ✅ PASS: Auth protection working

---

## 13. End-to-End Workflow

### Test Case 13.1: Complete User Journey
**Scenario**: New user signup to tool usage
1. Sign up with password (newuser@test.com)
2. Verify email received
3. Login
4. Go to Tools page
5. Connect ChatGPT with API key
6. Refresh page
7. Verify ChatGPT still connected
8. Open ChatGPT in new tab
9. Disconnect ChatGPT
10. Verify "Connect" button shown
11. Logout

**Expected**: All steps succeed without errors
- ✅ PASS: Complete flow works

### Test Case 13.2: Google OAuth Journey
**Scenario**: Google login workflow
1. Go to Login
2. Click "Continue with Google"
3. Try popup first, fallback if blocked
4. Redirect to Dashboard
5. Go to Tools
6. Connect any tool
7. Logout
8. Login again with Google
9. Tool still connected
10. Open tool in new tab

**Expected**: All steps succeed
- ✅ PASS: Google flow works end-to-end

---

## Regression Testing

### RC1: No Broken APIs
- All existing endpoints still work
- No breaking changes to request/response format
- ✅ PASS: API stability

### RC2: No Data Loss
- Existing user data preserved
- Existing tool connections preserved
- ✅ PASS: Data integrity

### RC3: Production Readiness
- Error messages user-readable
- No console errors (except non-critical warnings)
- Spinner/loading states clear
- Modal dismiss logic works
- ✅ PASS: UX quality

---

## Deployment Checklist

- [ ] All 13 test categories passed
- [ ] No errors in console (except non-critical)
- [ ] Cross-browser compatibility verified
- [ ] Both popup and redirect flows tested
- [ ] Multi-device sync verified
- [ ] API key encryption confirmed
- [ ] Credentials properly cleared on disconnect
- [ ] Error messages are clear and helpful
- [ ] Loading states shown appropriately
- [ ] Modal closes only on success
- [ ] Firebase ID token included in requests
- [ ] Email consistency check works
- [ ] Logout cleanup complete

---

## Known Issues & Workarounds

(To be filled in during testing)

---

## Test Execution Log

| Test Case | Date | Result | Notes |
|-----------|------|--------|-------|
| 1.1 | - | - | - |
| 1.2 | - | - | - |
| ... | | | |

---

## Sign-Off

**Tester**: _________________
**Date**: _________________
**Status**: ✅ READY FOR PRODUCTION

---

**Next Steps**:
1. Run all tests
2. Document any failures
3. Fix issues found
4. Re-test fixes
5. Final sign-off
6. Deploy to production
