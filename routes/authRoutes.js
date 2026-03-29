const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile?.emails?.[0]?.value;
        if (!email) return done(new Error('No email for Google user'));

        const normalizedEmail = String(email).trim().toLowerCase();
        if (!normalizedEmail.endsWith('@gmail.com')) {
          return done(new Error('Google email must be @gmail.com'));
        }

        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
          user = await User.findOne({ email: normalizedEmail });
        }

        if (user) {
          user.provider = 'google';
          user.googleId = profile.id;
          user.googleAccessToken = accessToken;
          if (refreshToken) user.googleRefreshToken = refreshToken;
          user.email = normalizedEmail;
          user.lastLogin = new Date();
          await user.save();
          return done(null, user);
        }

        const newUser = new User({
          name: profile.displayName || 'Google User',
          email: normalizedEmail,
          provider: 'google',
          googleId: profile.id,
          googleAccessToken: accessToken,
          googleRefreshToken: refreshToken,
          lastLogin: new Date(),
        });
        await newUser.save();
        return done(null, newUser);
      } catch (err) {
        return done(err);
      }
    }
  ));

  router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

  router.get(
    '/google/callback',
    passport.authenticate('google', {
      session: false,
      failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?auth=failed`,
    }),
    (req, res) => {
      if (!req.user) {
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?auth=failed`);
      }
      if (!process.env.JWT_SECRET) {
        return res.status(500).json({ message: 'JWT_SECRET not configured' });
      }

      const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
      const redirectUrl = new URL(process.env.FRONTEND_URL || 'http://localhost:5173');
      redirectUrl.searchParams.set('token', token);
      redirectUrl.searchParams.set('provider', 'google');
      return res.redirect(redirectUrl.toString());
    }
  );

  router.get('/logout', (req, res, next) => {
    if (req.logout) {
      req.logout((err) => {
        if (err) return next(err);
        res.redirect(process.env.FRONTEND_URL || 'http://localhost:5173');
      });
    } else {
      res.redirect(process.env.FRONTEND_URL || 'http://localhost:5173');
    }
  });
} else {
  console.warn('Google OAuth credentials are not configured; /auth/google endpoints are disabled.');
}

module.exports = router;
