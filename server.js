require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
// Note: __dirname is already available in CommonJS environments


const userRoutes = require("./routes/UserRoutes");
const toolRoutes = require("./routes/toolsRoutes");
const dashboardRoutes = require("./routes/DashboardRoutes");
const supportRoutes = require("./routes/supportRoutes");
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('./models/User');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');

const app = express();   // ⭐ CREATE APP FIRST

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
// Initialize passport for OAuth
app.use(passport.initialize());

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
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true
};

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
// Admin routes (stats / management)
const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);

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

// Serve static files AFTER API routes
app.use(express.static(path.join(__dirname, "dist")));

// Production SPA Fallback: Must be at the VERY END
app.use((req, res) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
  } else {
    // If not a GET request or it's an /api route, return consistent 404
    res.status(404).json({ message: 'Resource not found' });
  }
});


const PORT = process.env.PORT || 5000;
// app.listen moved inside mongoose.connect.then() (lines 63-80)

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