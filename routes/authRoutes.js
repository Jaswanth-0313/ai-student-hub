const express = require('express');
const router = express.Router();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const ToolConnection = require('../models/ToolConnection');
const jwt = require('jsonwebtoken');

// ========================================
// 🔐 GOOGLE OAUTH STRATEGY SETUP
// ========================================
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || `${process.env.BASE_URL || 'http://localhost:5000'}/auth/google/callback`
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('🔍 Google OAuth Profile:', {
        id: profile.id,
        displayName: profile.displayName,
        emails: profile.emails
      });

      const email = profile.emails && profile.emails[0] && profile.emails[0].value;
      if (!email) {
        console.error('❌ No email from Google profile');
        return done(new Error('No email from Google'));
      }

      const normalizedEmail = String(email).toLowerCase();

      // Optional: Only allow Gmail addresses (can be removed if you want any Google account)
      if (!normalizedEmail.endsWith('@gmail.com')) {
        console.warn('⚠️ Non-Gmail account attempted:', normalizedEmail);
        return done(new Error('Google account must be a @gmail.com address'));
      }

      // Check if user already exists with this googleId
      let user = await User.findOne({ googleId: profile.id });
      
      if (user) {
        console.log('✅ Existing user found by googleId:', user.email);
        // Update user info and Gmail tokens
        user.name = profile.displayName || user.name;
        user.email = normalizedEmail;
        user.provider = 'google';
        user.googleAccessToken = accessToken;
        user.googleRefreshToken = refreshToken;
        user.googleTokenExpiry = new Date(Date.now() + 3600 * 1000); // 1 hour from now
        await user.save();
        console.log('✅ Gmail tokens updated for existing user');
        return done(null, user);
      }

      // Check if email already exists (link accounts)
      user = await User.findOne({ email: normalizedEmail });
      if (user) {
        console.log('✅ Existing user found by email:', email, '- Linking Google account');
        user.googleId = profile.id;
        user.provider = 'google';
        user.name = profile.displayName || user.name;
        user.googleAccessToken = accessToken;
        user.googleRefreshToken = refreshToken;
        user.googleTokenExpiry = new Date(Date.now() + 3600 * 1000);
        await user.save();
        console.log('✅ Gmail tokens stored for linked account');
        return done(null, user);
      }

      // Create new user with Gmail tokens
      console.log('✨ Creating new user from Google OAuth:', normalizedEmail);
      const newUser = new User({
        name: profile.displayName || 'Student',
        email: normalizedEmail,
        googleId: profile.id,
        googleAccessToken: accessToken,
        googleRefreshToken: refreshToken,
        googleTokenExpiry: new Date(Date.now() + 3600 * 1000),
        provider: 'google',
        accountStatus: 'active'
      });

      await newUser.save();
      console.log('✅ New user created with Gmail tokens:', newUser.email);
      return done(null, newUser);

    } catch (err) {
      console.error('❌ Google OAuth error:', err.message);
      done(err);
    }
  }));
}

// ========================================
// 🛣️ AUTH ROUTES
// ========================================

// Debug: log every auth request to verify this router is used
router.use((req, res, next) => {
  console.log(`🧩 authRoutes received: ${req.method} ${req.originalUrl}`);
  next();
});

/**
 * @route   GET /auth/test
 * @desc    Test route to verify auth routes are mounted
 * @access  Public
 */
router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes are working', timestamp: new Date().toISOString() });
});

/**
 * @route   GET /auth/google
 * @desc    Initiate Google OAuth flow
 * @access  Public
 */
router.get(
  '/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    prompt: 'select_account' // Force account selection
  })
);

/**
 * @route   GET /auth/google/callback
 * @desc    Google OAuth callback
 * @access  Public
 */
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://ai-student-hub.web.app'

router.get(
  '/google/callback',
  passport.authenticate('google', { 
    session: false,
    failureRedirect: `${FRONTEND_URL}?auth=failed`
  }),
  async (req, res) => {
    try {
      if (!process.env.JWT_SECRET) {
        return res.status(500).json({ message: 'JWT_SECRET not configured on server' });
      }

      // Generate JWT token for frontend
      const token = jwt.sign(
        { id: req.user._id },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );

      const redirectUrl = new URL(FRONTEND_URL);
      redirectUrl.searchParams.set('token', token);
      redirectUrl.searchParams.set('user', JSON.stringify({
        id: req.user._id,
        name: req.user.name,
        email: req.user.email
      }));

      try {
        await ToolConnection.findOneAndUpdate(
          { userId: req.user._id, toolName: 'gmail' },
          { userId: req.user._id, toolName: 'gmail', connected: true, connectedAt: new Date() },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      } catch (cErr) {
        console.warn('Auto-connect Gmail on OAuth failed:', cErr.message);
      }

      console.log('✅ Google OAuth successful, redirecting to:', redirectUrl.toString());
      res.redirect(redirectUrl.toString());
    } catch (err) {
      console.error('❌ OAuth callback error:', err);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}?auth=error&message=${encodeURIComponent(err.message)}`);
    }
  }
);

/**
 * @route   GET /auth/google/user
 * @desc    Get current Google-authenticated user
 * @access  Private (from session)
 */
router.get('/google/user', (req, res) => {
  if (req.user) {
    res.json({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      provider: req.user.provider
    });
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});

/**
 * @route   GET /auth/logout
 * @desc    Logout user (clear session)
 * @access  Private
 */
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Logout error', error: err.message });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

module.exports = router;
