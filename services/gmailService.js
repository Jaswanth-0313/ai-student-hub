/**
 * Gmail Service Layer
 * 
 * Handles all Gmail API interactions:
 * - Fetch user emails
 * - Send emails
 * - Update user OAuth tokens
 * 
 * Uses: googleapis, mongoose User model
 */

const { google } = require('googleapis');
const User = require('../models/User');

// Initialize Gmail API
const gmail = google.gmail('v1');

/**
 * Create OAuth2 client from user credentials
 * @param {String} userId - MongoDB user ID
 * @returns {Object} OAuth2 client ready for Gmail API calls
 */
async function getOAuth2Client(userId) {
  try {
    const user = await User.findById(userId);
    
    if (!user || !user.googleAccessToken) {
      throw new Error('User not found or no Google access token');
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_CALLBACK_URL || `${process.env.BASE_URL || 'http://localhost:5000'}/auth/google/callback`
    );

    oauth2Client.setCredentials({
      access_token: user.googleAccessToken,
      refresh_token: user.googleRefreshToken,
      expiry_date: user.googleTokenExpiry
    });

    // Handle token refresh
    oauth2Client.on('tokens', async (tokens) => {
      try {
        if (tokens.refresh_token) {
          user.googleRefreshToken = tokens.refresh_token;
        }
        if (tokens.access_token) {
          user.googleAccessToken = tokens.access_token;
        }
        if (tokens.expiry_date) {
          user.googleTokenExpiry = tokens.expiry_date;
        }
        await user.save();
        console.log('✅ Google tokens updated for user:', user.email);
      } catch (err) {
        console.error('❌ Error updating tokens:', err.message);
      }
    });

    return oauth2Client;
  } catch (err) {
    console.error('❌ Error getting OAuth2 client:', err.message);
    throw err;
  }
}

/**
 * Fetch user emails from Gmail
 * @param {String} userId - MongoDB user ID
 * @param {Number} maxResults - Max emails to fetch (default: 10)
 * @returns {Array} Array of email objects
 */
async function getUserEmails(userId, maxResults = 10) {
  try {
    const oauth2Client = await getOAuth2Client(userId);
    
    // List messages
    const listResponse = await gmail.users.messages.list({
      auth: oauth2Client,
      userId: 'me',
      maxResults: maxResults,
      q: 'in:inbox is:unread' // Get unread emails in inbox
    });

    const messages = listResponse.data.messages || [];

    if (messages.length === 0) {
      console.log('ℹ️  No unread emails found');
      return [];
    }

    // Get full message details for each email
    const emailPromises = messages.map(msg =>
      gmail.users.messages.get({
        auth: oauth2Client,
        userId: 'me',
        id: msg.id,
        format: 'full'
      })
    );

    const emailResponses = await Promise.all(emailPromises);

    // Parse emails
    const emails = emailResponses.map(response => {
      const message = response.data;
      const headers = message.payload.headers;

      const getHeader = (name) => {
        const header = headers.find(h => h.name === name);
        return header ? header.value : 'Unknown';
      };

      // Get email body
      let body = '';
      if (message.payload.parts) {
        const part = message.payload.parts.find(p => p.mimeType === 'text/plain');
        if (part && part.body.data) {
          body = Buffer.from(part.body.data, 'base64').toString('utf-8');
        }
      } else if (message.payload.body.data) {
        body = Buffer.from(message.payload.body.data, 'base64').toString('utf-8');
      }

      return {
        id: message.id,
        from: getHeader('From'),
        to: getHeader('To'),
        subject: getHeader('Subject'),
        date: getHeader('Date'),
        body: body.substring(0, 200) + (body.length > 200 ? '...' : ''),
        snippet: message.snippet,
        unread: message.labelIds?.includes('UNREAD') || false
      };
    });

    console.log(`✅ Fetched ${emails.length} emails for user:`, userId);
    return emails;
  } catch (err) {
    console.error('❌ Gmail API error:', err.message);
    throw new Error(`Failed to fetch emails: ${err.message}`);
  }
}

/**
 * Get Gmail profile info
 * @param {String} userId - MongoDB user ID
 * @returns {Object} Gmail profile
 */
async function getGmailProfile(userId) {
  try {
    const oauth2Client = await getOAuth2Client(userId);

    const profile = await gmail.users.getProfile({
      auth: oauth2Client,
      userId: 'me'
    });

    console.log('✅ Gmail profile fetched for user:', userId);
    return {
      email: profile.data.emailAddress,
      messagesTotal: profile.data.messagesTotal,
      threadsTotal: profile.data.threadsTotal,
      historyId: profile.data.historyId
    };
  } catch (err) {
    console.error('❌ Gmail profile error:', err.message);
    throw new Error(`Failed to fetch Gmail profile: ${err.message}`);
  }
}

/**
 * Send email via Gmail
 * @param {String} userId - MongoDB user ID
 * @param {String} to - Recipient email
 * @param {String} subject - Email subject
 * @param {String} message - Email body
 * @returns {Object} Send result
 */
async function sendEmail(userId, to, subject, message) {
  try {
    const oauth2Client = await getOAuth2Client(userId);

    // Create email
    const email = [
      `From: me`,
      `To: ${to}`,
      `Subject: ${subject}`,
      '',
      message
    ].join('\n');

    // Encode to base64url
    const encodedMessage = Buffer.from(email)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    const sendResponse = await gmail.users.messages.send({
      auth: oauth2Client,
      userId: 'me',
      requestBody: {
        raw: encodedMessage
      }
    });

    console.log('✅ Email sent from user:', userId);
    return {
      success: true,
      messageId: sendResponse.data.id,
      to: to,
      subject: subject
    };
  } catch (err) {
    console.error('❌ Send email error:', err.message);
    throw new Error(`Failed to send email: ${err.message}`);
  }
}

/**
 * Update user's Google tokens (called after OAuth)
 * @param {String} userId - MongoDB user ID
 * @param {String} accessToken - Google access token
 * @param {String} refreshToken - Google refresh token
 * @param {Number} expiryDate - Token expiry timestamp
 */
async function updateGoogleTokens(userId, accessToken, refreshToken, expiryDate) {
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      {
        googleAccessToken: accessToken,
        googleRefreshToken: refreshToken,
        googleTokenExpiry: expiryDate
      },
      { new: true }
    );

    console.log('✅ Google tokens updated for user:', user.email);
    return user;
  } catch (err) {
    console.error('❌ Error updating Google tokens:', err.message);
    throw err;
  }
}

module.exports = {
  getOAuth2Client,
  getUserEmails,
  getGmailProfile,
  sendEmail,
  updateGoogleTokens
};
