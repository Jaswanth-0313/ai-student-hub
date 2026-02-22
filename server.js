require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const userRoutes = require("./routes/UserRoutes");
const toolRoutes = require("./routes/toolsRoutes");
const dashboardRoutes = require("./routes/DashboardRoutes");

const app = express();   // ⭐ CREATE APP FIRST

app.use(express.json());
// Configure CORS: allow origins via env `CORS_ORIGIN` (comma-separated), otherwise allow all
const corsOptions = {
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true
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
  console.warn('Warning: JWT_SECRET is not set. Using fallback secret in code; set JWT_SECRET for production.');
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
  if (req.path.startsWith('/api')) return next();
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