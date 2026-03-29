/**
 * Firebase Admin SDK Configuration
 * Used for backend OAuth token verification and cross-platform authentication
 * 
 * For frontend, use: npm install firebase react-firebase-hooks
 * Frontend config will reference this backend for secure token validation
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK (optional, if you want backend Firebase integration)
const initializeFirebase = () => {
  // Only initialize if all required env vars are present
  const requiredVars = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_PRIVATE_KEY_ID',
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_CLIENT_ID'
  ];

  const hasAllVars = requiredVars.every(varName => process.env[varName]);

  if (!hasAllVars) {
    console.warn('⚠️  Firebase Admin SDK not configured. Set all FIREBASE_* env vars to enable.');
    return null;
  }

  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        type: 'service_account',
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: process.env.FIREBASE_AUTH_URI,
        token_uri: process.env.FIREBASE_TOKEN_URI,
        auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
      }),
      databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
    });

    console.log('✅ Firebase Admin SDK initialized');
    return admin;
  } catch (error) {
    console.warn('⚠️  Firebase Admin SDK initialization failed:', error.message);
    return null;
  }
};

/**
 * Verify Firebase ID Token (useful for mobile/web clients)
 * Usage: Call this in protected routes to verify Firebase tokens from frontend
 */
const verifyFirebaseToken = async (idToken) => {
  try {
    const firebaseAdmin = admin;
    if (!firebaseAdmin.apps?.length) {
      throw new Error('Firebase not initialized');
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Firebase token verification failed:', error.message);
    throw error;
  }
};

/**
 * Middleware to verify Firebase token from Authorization header
 * Usage: app.use(firebaseAuthMiddleware) or use in specific routes
 */
const firebaseAuthMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No Firebase token provided' });
    }

    const decodedToken = await verifyFirebaseToken(token);
    req.firebaseUser = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid Firebase token', error: error.message });
  }
};

module.exports = {
  initializeFirebase,
  verifyFirebaseToken,
  firebaseAuthMiddleware,
  admin
};
