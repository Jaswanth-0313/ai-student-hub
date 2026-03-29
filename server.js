require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const userRoutes = require("./routes/UserRoutes");
const toolRoutes = require("./routes/toolsRoutes");
const dashboardRoutes = require("./routes/DashboardRoutes");
const supportRoutes = require("./routes/supportRoutes");
const authRoutes = require("./routes/authRoutes");
const gmailRoutes = require("./routes/gmailRoutes");
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const User = require('./models/User');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');

const app = express();   // ⭐ CREATE APP FIRST
const PORT = process.env.PORT || 5000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

<<<<<<< HEAD
// Global crash safety
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

app.use(express.json());
=======
>>>>>>> 70f6487315ffb4abfc0e2702cd18e56bbd3189d9
// Security middlewares
// Security middlewares with relaxed CSP for Firebase
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "img-src": ["'self'", "data:", "https://www.gstatic.com", "https://*.googleapis.com"],
      "connect-src": ["'self'", "https://*.googleapis.com", "https://*.firebaseio.com", "https://*.firebaseapp.com"],
      "script-src": ["'self'", "'unsafe-inline'", "https://www.gstatic.com", "https://apis.google.com"],
      "frame-src": ["'self'", "https://*.firebaseapp.com"]
    },
  },
}));
app.use(compression());

// ✅ EXPRESS SESSION - Required for Passport OAuth
app.use(session({
  secret: process.env.JWT_SECRET || 'session-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize passport for OAuth
app.use(passport.initialize());
app.use(passport.session());

// ✅ PASSPORT SERIALIZATION - Required for session handling
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Basic rate limiter for auth and sensitive endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' }
});

// Apply to auth routes
app.use('/api/users/login', authLimiter);
app.use('/api/users/create', authLimiter);
app.use('/api/users/forgot-password', authLimiter);
app.use('/api/tools/devcpp/compile', authLimiter);
<<<<<<< HEAD
// Configure CORS: allow origins via env `CORS_ORIGIN`; fallback to FRONTEND_URL + local dev URLs
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim()).filter(Boolean)
  : [
      process.env.FRONTEND_URL || 'https://ai-student-hub.web.app',
      'http://localhost:5174',
      'http://localhost:5173',
      'http://localhost:5000'
    ];

const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.warn(`Blocked CORS request from origin: ${origin}`);
    return callback(new Error('Not allowed by CORS'));
=======
// Configure CORS: allow origins via env `CORS_ORIGIN` (comma-separated)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL,
  'https://ai-student-hub-cwql.onrender.com'
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
>>>>>>> 70f6487315ffb4abfc0e2702cd18e56bbd3189d9
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true
};

<<<<<<< HEAD
if (!process.env.CORS_ORIGIN) {
  console.warn('CORS_ORIGIN not set; using FRONTEND_URL and localhost defaults');
}
=======
>>>>>>> 70f6487315ffb4abfc0e2702cd18e56bbd3189d9
app.use(cors(corsOptions));

console.log("⏳ Connecting to MongoDB...");
mongoose.connect(process.env.MONGO_URI, {
  dbName: "ai_student_hub"
})
  .then(() => {
    console.log("✅ MongoDB connected successfully to: " + mongoose.connection.name);

    // Start server ONLY after DB is ready
    app.listen(PORT, () => {
      console.log("🚀 AI Student Hub Server started on port " + PORT);
      console.log("📖 API Documentation: http://localhost:" + PORT + "/api/docs");
      console.log("🌐 Frontend: http://localhost:" + PORT);
    });

    // Ensure admin account is present
    ensureAdmin();
  })
  .catch(err => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1); // Stop if DB fails
  });

// Warn when critical environment variables are missing
if (!process.env.MONGO_URI) {
  console.warn('Warning: MONGO_URI is not set. Production will fail to connect to database.');
}
if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET is not set. Generate a strong secret and set JWT_SECRET in your .env.');
}

// Root health-check route
app.get('/', (req, res) => {
  res.send('Backend working');
});

// 🔗 API ROUTES - Define these BEFORE static files
app.get("/api/docs", (req, res) => {
  res.json({
    title: "AI Student Hub API Documentation",
    version: "1.0.0",
    description: "A unified ecosystem for students to access AI tools",
    baseURL: "http://localhost:5000",
    endpoints: {
      authentication: {
        "POST /api/users/create": "Register new user",
        "POST /api/users/login": "Login user (returns JWT token)",
        "GET /api/users": "Get all users (admin only)",
        "GET /api/users/:id": "Get user by ID"
      },
      tools: {
        "POST /api/tools/connect/:toolName": "Connect a tool",
        "POST /api/tools/disconnect/:toolName": "Disconnect a tool",
        "GET /api/tools/mytools": "Get user's connected tools",
        "GET /api/tools/redirect/:toolName": "Redirect to tool",
        "POST /api/tools/recommend": "Get smart recommendations"
      },
      dashboard: {
        "GET /api/dashboard": "Get user dashboard",
        "GET /api/dashboard/resources": "Get learning resources",
        "POST /api/dashboard/search": "Search tools and content"
      }
    },
    supportedTools: [
      "chatGPT - Content generation & explanations",
      "gamma - Presentation creation",
      "figma - UI/UX design",
      "lovable - App development",
      "canva - Graphic design",
      "github - Code collaboration",
      "leetcode - Coding practice"
    ]
  });
});

app.use("/api/users", userRoutes);

app.use("/api/tools", toolRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use('/api/support', supportRoutes);
// ✅ NEW: Auth routes (Google OAuth, etc.)
app.use('/auth', (req, res, next) => {
  console.log(`🛣️ Auth route match: ${req.method} ${req.originalUrl}`);
  next();
});
app.use('/auth', authRoutes);
// ✅ NEW: Gmail API routes
app.use('/api/gmail', gmailRoutes);
// Admin routes (stats / management)
const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);

<<<<<<< HEAD
// Keep Google OAuth in routes/authRoutes.js instead of redefining here.
// This avoids path conflicts and ensures /auth/google exists.
=======
// Health Check for Production Debugging
app.get("/api/health", (req, res) => {
  const fs = require('fs');
  const healthDistPath = path.resolve(__dirname, "frontend", "dist");
  res.json({
    status: "ok",
    uptime: process.uptime(),
    __dirname,
    env: process.env.NODE_ENV,
    filesystem: {
      rootFiles: fs.readdirSync(__dirname).filter(f => !f.startsWith('.')),
      distExists: fs.existsSync(healthDistPath),
      indexExists: fs.existsSync(path.join(healthDistPath, "index.html"))
    }
  });
});

// ---- Google OAuth routes (stateless, issues JWT) ----
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || (process.env.BASE_URL ? `${process.env.BASE_URL}/api/users/google/callback` : "http://localhost:5000/api/users/google/callback")
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails && profile.emails[0] && profile.emails[0].value;
      if (!email) return done(new Error('No email from Google'));

      const normalizedEmail = String(email).toLowerCase();
      // Only allow Gmail addresses
      if (!normalizedEmail.endsWith('@gmail.com')) {
        return done(new Error('Google account must be a @gmail.com address'));
      }

      let user = await User.findOne({ googleId: profile.id });
      if (!user) {
        // If a user exists with same email, link accounts
        user = await User.findOne({ email: normalizedEmail });
      }

      if (user) {
        user.provider = 'google';
        user.googleId = profile.id;
        user.email = normalizedEmail;
        await user.save();
        return done(null, user);
      }

      const newUser = new User({
        name: profile.displayName || 'Google User',
        email: normalizedEmail,
        provider: 'google',
        googleId: profile.id
      });
      await newUser.save();
      return done(null, newUser);
    } catch (err) {
      done(err);
    }
  }));

  app.get('/api/users/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

  app.get('/api/users/google/callback', passport.authenticate('google', { session: false, failureRedirect: (process.env.FRONTEND_URL || '/') + '?auth=failed' }), (req, res) => {
    // Issue JWT and redirect to frontend with token
    if (!process.env.JWT_SECRET) return res.status(500).json({ message: 'JWT_SECRET not configured on server' });
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    const redirectTo = process.env.FRONTEND_URL || 'http://localhost:5173';
    try {
      const url = new URL(redirectTo);
      url.searchParams.set('token', token);
      return res.redirect(url.toString());
    } catch (e) {
      console.error("Invalid FRONTEND_URL during redirect:", redirectTo);
      return res.redirect(`/?token=${token}`);
    }
  });
} else {
  console.warn('Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env to enable.');
}
>>>>>>> 70f6487315ffb4abfc0e2702cd18e56bbd3189d9

// Serve static files AFTER API routes
const publicPath = path.join(__dirname, 'public');
const distPath = path.join(__dirname, 'frontend', 'dist');

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}
app.use(express.static(publicPath));

// API 404 handler - important to keep this before the SPA fallback
app.use('/api', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
    docs: '/api/docs'
  });
});

// SPA Fallback: Must be the last route.
// app.use() is used here for Express 5 compatibility (app.get("*") is invalid in Express 5).
// Only serve index.html for GET requests; API 404s handled above.
app.use((req, res, next) => {
  if (req.method !== 'GET') return next();
<<<<<<< HEAD
  if (req.path.startsWith('/api') || req.path.startsWith('/auth')) return next();
  // If the client accepts HTML, serve the SPA with no-cache headers
  if (req.accepts && req.accepts('html')) {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.sendFile(path.join(__dirname, 'public', 'index.html'));
=======
  if (req.path.startsWith('/api')) return next();

  const candidateIndex = fs.existsSync(path.join(distPath, 'index.html'))
    ? path.join(distPath, 'index.html')
    : path.join(publicPath, 'index.html');

  if (!fs.existsSync(candidateIndex)) {
    console.error(`❌ CRITICAL: Frontend build not found. Checked dist: ${distPath}, public: ${publicPath}`);
    return res.status(500).send(`
      <div style="font-family: sans-serif; padding: 2rem; max-width: 600px; margin: 0 auto; line-height: 1.6;">
        <h1 style="color: #e11d48;">Frontend Not Found</h1>
        <p>The server is running but the frontend build is missing.</p>
      </div>
    `);
>>>>>>> 70f6487315ffb4abfc0e2702cd18e56bbd3189d9
  }

  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  return res.sendFile(candidateIndex);
});






// PORT is declared at the top of the file

// Ensure admin account is present/rotated on startup (if env vars provided)
const bcrypt = require('bcryptjs');
const UserModel = require('./models/User');
const mongooseConn = mongoose.connection;

async function ensureAdmin() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminEmail || !adminPassword) return;
    const hashed = await bcrypt.hash(adminPassword, 12);
    await UserModel.findOneAndUpdate({ email: adminEmail.toLowerCase() }, { $set: { name: 'Administrator', email: adminEmail.toLowerCase(), password: hashed, provider: 'local', accountStatus: 'active' } }, { upsert: true });
    console.log('Admin user ensured/rotated for', adminEmail);
  } catch (err) {
    console.error('ensureAdmin error', err);
  }
}

mongooseConn.once('open', () => {
  // ensureAdmin(); // Handled in .then()
});