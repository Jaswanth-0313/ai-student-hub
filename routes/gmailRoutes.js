/**
 * Gmail API Routes
 * 
 * Protected routes for fetching and managing Gmail
 * Requires: JWT token in Authorization header
 */

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { 
  getUserEmails, 
  getGmailProfile, 
  sendEmail 
} = require('../services/gmailService');

/**
 * @route   GET /api/gmail/emails
 * @desc    Fetch user emails from Gmail
 * @access  Private (JWT required)
 * @query   maxResults - Number of emails to fetch (default: 10)
 */
router.get('/emails', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const maxResults = parseInt(req.query.maxResults) || 10;

    console.log(`📧 Fetching emails for user:`, userId);

    const emails = await getUserEmails(userId, maxResults);

    res.json({
      success: true,
      count: emails.length,
      emails: emails
    });
  } catch (err) {
    console.error('❌ Gmail fetch error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch emails',
      error: err.message
    });
  }
});

/**
 * @route   GET /api/gmail/profile
 * @desc    Get Gmail profile information
 * @access  Private (JWT required)
 */
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    console.log(`👤 Fetching Gmail profile for user:`, userId);

    const profile = await getGmailProfile(userId);

    res.json({
      success: true,
      profile: profile
    });
  } catch (err) {
    console.error('❌ Gmail profile error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch Gmail profile',
      error: err.message
    });
  }
});

/**
 * @route   POST /api/gmail/send
 * @desc    Send email via Gmail
 * @access  Private (JWT required)
 * @body    { to, subject, message }
 */
router.post('/send', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { to, subject, message } = req.body;

    // Validation
    if (!to || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: to, subject, message'
      });
    }

    console.log(`📨 Sending email from user:`, userId);

    const result = await sendEmail(userId, to, subject, message);

    res.json({
      success: true,
      result: result
    });
  } catch (err) {
    console.error('❌ Send email error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to send email',
      error: err.message
    });
  }
});

/**
 * @route   GET /api/gmail/status
 * @desc    Check Gmail connection status
 * @access  Private (JWT required)
 */
router.get('/status', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const User = require('../models/User');

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const hasGmail = !!(user.googleAccessToken && user.provider === 'google');

    res.json({
      success: true,
      connected: hasGmail,
      email: hasGmail ? user.email : null,
      provider: user.provider
    });
  } catch (err) {
    console.error('❌ Gmail status error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to check Gmail status',
      error: err.message
    });
  }
});

module.exports = router;
