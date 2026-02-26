# Change Password & Settings Implementation Guide

## 1. Folder Structure Updates
```text
ai-student-hub/
├── models/
│   └── User.js              // Removed resetToken & resetExpires fields
├── routes/
│   └── UserRoutes.js        // Removed forgot-password & reset-password, updated change-password
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.jsx   // Removed Profile link, added Settings link
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx // Replaced Profile button with Settings
│   │   │   └── Settings.jsx  // NEW: Contains read-only profile & Change Password
│   │   ├── services/
│   │   │   └── api.js        // Mapped changePassword to PUT, removed old routes
│   │   └── App.jsx           // Registered /settings Protected Route
```

## 2. Backend Code Highlights
*   **Method Changed to PUT:** The endpoint was fundamentally refactored to align with RESTful principles.
*   **Strong Validations:** Included bcrypt comparison and ensured new passwords are at least 8 characters long on the backend.
```javascript
// PUT /api/users/change-password
router.put('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) 
      return res.status(400).json({ message: 'Both passwords required' });
    if (newPassword.length < 8) 
      return res.status(400).json({ message: 'New password must be > 8 chars' });

    const user = await User.findById(req.userId);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Current password incorrect' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    res.status(200).json({ message: 'Password changed successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});
```

## 3. Frontend Code Highlights
The `Settings.jsx` page was created as a clean, single-page interface using Tailwind CSS and React state management.
*   No plain text elements; passwords masked using strictly `type="password"`.
*   Enforced minLength bounds using HTML5 validation attributes alongside React controlled limits.
*   Shows explicit error states returned dynamically from Axios context triggers.

## 4. API Integration Flow
We use Axios globally scoped (`api.js`) where the `AuthMiddleware` attaches the JWT token silently.
```javascript
export const profileAPI = {
  me: () => api.get('/users/me'),
  changePassword: (payload) => api.put('/users/change-password', payload),
}
```

## 5. Step-by-Step Flow
1. **Login & Authenticate:** User logs in, acquiring the JWT token stored safely in `localStorage/AuthContext`.
2. **Navigate to Settings:** Clicking the 'Settings' button on the Dashboard or Navbar loads the `Settings.jsx` component seamlessly via React Router.
3. **Form Submission:** User inputs current password, new password, and confirm new password. The React app checks internally for parity (matching lengths & strings).
4. **API Dispatch:** Frontend pushes to `PUT /api/users/change-password`.
5. **Backend Verification:** Server reads Bearer JWT. Finds matching `_id` in Mongo. Hashes input current password to compare against DB password. 
6. **Persistence:** Generates new Salt (cost 10). Hashes the New Password. Saves Document. Returns 200 OK.
7. **Complete:** UI renders a green success flash bubble, and natively zeroes out the input fields dynamically state-refreshing the view without a window reload.
