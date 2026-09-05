require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const passport = require("passport");
const session = require("express-session");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const compression = require("compression");
const bcrypt = require("bcryptjs");

// Routes
const userRoutes = require("./routes/UserRoutes");
const toolRoutes = require("./routes/toolsRoutes");
const dashboardRoutes = require("./routes/DashboardRoutes");
const supportRoutes = require("./routes/supportRoutes");
const authRoutes = require("./routes/authRoutes");
const gmailRoutes = require("./routes/gmailRoutes");
const adminRoutes = require("./routes/adminRoutes");
const studyRoutes = require("./routes/studyRoutes");

// Models
const User = require("./models/User");

const app = express();
const PORT = process.env.PORT || 5000;

// ================= GLOBAL SAFETY =================
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

// ================= MIDDLEWARE =================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(compression());

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "img-src": ["'self'", "data:", "https://www.gstatic.com"],
        "connect-src": ["'self'", "https://*.googleapis.com", "https://*.firebaseio.com"],
        "script-src": ["'self'", "'unsafe-inline'", "https://www.gstatic.com"],
        "frame-src": ["'self'", "https://*.firebaseapp.com"],
      },
    },
  })
);

// ================= SESSION =================
app.use(
  session({
    secret: process.env.JWT_SECRET || "session-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// ================= CORS =================
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
  : [
      process.env.FRONTEND_URL || "https://ai-student-hub.web.app",
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5000",
    ];

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// ================= RATE LIMIT =================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use("/api/users/login", limiter);
app.use("/api/users/create", limiter);

// ================= ROUTES =================
app.use("/api/users", userRoutes);
app.use("/api/tools", toolRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/support", supportRoutes);
app.use("/auth", authRoutes);
app.use("/api/gmail", gmailRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/study", studyRoutes);

// ================= API DOCS =================
app.get('/api/docs', (req, res) => {
  res.json({
    title: "AI Student Hub API Documentation",
    version: "1.0.0",
    description: "A unified ecosystem for students to access AI tools",
    baseURL: process.env.BASE_URL || `http://localhost:${PORT}`,
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

// ================= ROOT =================
app.get("/", (req, res) => {
  res.send("Backend working 🚀");
});

// ================= DB =================
mongoose
  .connect(process.env.MONGO_URI, {
    dbName: "ai_student_hub",
  })
  .then(() => {
    console.log("MongoDB connected ✅");

    app.listen(PORT, () => {
      console.log(`Server running on ${PORT}`);
    });

    ensureAdmin();
  })
  .catch((err) => {
    console.error("MongoDB error:", err);
    process.exit(1);
  });

// ================= ADMIN =================
async function ensureAdmin() {
  try {
    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) return;

    const hashed = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);

    await User.findOneAndUpdate(
      { email: process.env.ADMIN_EMAIL.toLowerCase() },
      {
        $set: {
          name: "Administrator",
          email: process.env.ADMIN_EMAIL.toLowerCase(),
          password: hashed,
          provider: "local",
          accountStatus: "active",
        },
      },
      { upsert: true }
    );

    console.log("Admin ensured ✅");
  } catch (err) {
    console.error(err);
  }
}