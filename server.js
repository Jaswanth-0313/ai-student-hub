require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

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

// Global crash safety
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

app.use(express.json());
// Security middlewares
app.use(helmet());
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
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true
};

if (!process.env.CORS_ORIGIN) {
  console.warn('CORS_ORIGIN not set; using FRONTEND_URL and localhost defaults');
}
app.use(cors(corsOptions));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch(err => console.log("MongoDB Connection Failed: ", err));

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

// Keep Google OAuth in routes/authRoutes.js instead of redefining here.
// This avoids path conflicts and ensures /auth/google exists.

// Serve static files AFTER API routes
app.use(express.static(path.join(__dirname, "public")));

// If request starts with /api and hasn't matched any route, return JSON 404
app.use('/api', (req, res) => {
  return res.status(404).json({
    message: 'Endpoint not found',
    availableEndpoints: 'GET /api/docs'
  });
});

// Serve SPA index.html for all other GET requests (allow client-side routing)
app.use((req, res, next) => {
  if (req.method !== 'GET') return next();
  if (req.path.startsWith('/api') || req.path.startsWith('/auth')) return next();
  // If the client accepts HTML, serve the SPA with no-cache headers
  if (req.accepts && req.accepts('html')) {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
  next();
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("🚀 AI Student Hub Server started on port " + PORT);
  console.log("📖 API Documentation: http://localhost:" + PORT + "/api/docs");
  console.log("🌐 Frontend: http://localhost:" + PORT);
});

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
  ensureAdmin();
});