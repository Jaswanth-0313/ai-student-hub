const express = require("express");
const router = express.Router();
const User = require("../models/User");
const ToolIntegration = require("../models/ToolIntegration");
const authMiddleware = require("../middleware/authMiddleware");

// 📊 GET USER DASHBOARD
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    // Get user data
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get tool integrations
    let toolIntegration = await ToolIntegration.findOne({ userId });

    if (!toolIntegration) {
      toolIntegration = new ToolIntegration({ userId });
      await toolIntegration.save();
    }

    // Count connected tools
    const connectedTools = [
      toolIntegration.chatGPT?.enabled,
      toolIntegration.gamma?.enabled,
      toolIntegration.figma?.enabled,
      toolIntegration.lovable?.enabled,
      toolIntegration.canva?.enabled,
      toolIntegration.github?.enabled,
      toolIntegration.leetcode?.enabled
    ].filter(Boolean).length;

    // Prepare dashboard data
    const dashboard = {
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      stats: {
        totalToolsAvailable: 7,
        connectedTools: connectedTools,
        integrationPercentage: Math.round((connectedTools / 7) * 100),
        lastUpdated: toolIntegration.updatedAt
      },
      availableTools: [
        {
          id: "chatGPT",
          name: "ChatGPT",
          description: "Content generation & explanations",
          icon: "🤖",
          connected: toolIntegration.chatGPT?.enabled || false,
          category: "AI Assistant",
          features: ["Explanations", "Content Generation", "Brainstorming"]
        },
        {
          id: "gamma",
          name: "Gamma",
          description: "Presentation creation",
          icon: "📊",
          connected: toolIntegration.gamma?.enabled || false,
          category: "Presentations",
          features: ["Slide Creation", "AI Design", "Presenter Notes"]
        },
        {
          id: "figma",
          name: "Figma",
          description: "UI/UX design",
          icon: "🎨",
          connected: toolIntegration.figma?.enabled || false,
          category: "Design",
          features: ["Prototyping", "Collaboration", "Design System"]
        },
        {
          id: "lovable",
          name: "Lovable",
          description: "App development",
          icon: "💻",
          connected: toolIntegration.lovable?.enabled || false,
          category: "Development",
          features: ["AI Development", "Code Generation", "Debugging"]
        },
        {
          id: "canva",
          name: "Canva",
          description: "Graphic designing & visual content",
          icon: "🖼️",
          connected: toolIntegration.canva?.enabled || false,
          category: "Graphics",
          features: ["Templates", "Design Tools", "Stock Media"]
        },
        {
          id: "github",
          name: "GitHub",
          description: "Code hosting & collaboration",
          icon: "🐙",
          connected: toolIntegration.github?.enabled || false,
          category: "Collaboration",
          features: ["Version Control", "Repositories", "Collaboration"]
        },
        {
          id: "leetcode",
          name: "LeetCode",
          description: "Coding practice & interview preparation",
          icon: "💡",
          connected: toolIntegration.leetcode?.enabled || false,
          category: "Learning",
          features: ["Problem Solving", "Interview Prep", "Competitions"]
        }
      ],
      quickLinks: [
        {
          title: "Connect New Tool",
          action: "/api/tools/connect",
          icon: "🔗"
        },
        {
          title: "View All Tools",
          action: "/api/tools/mytools",
          icon: "📋"
        },
        {
          title: "Get Recommendations",
          action: "/api/tools/recommend",
          icon: "⭐"
        }
      ]
    };

    res.status(200).json(dashboard);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 📚 GET LEARNING RESOURCES
router.get("/resources", authMiddleware, async (req, res) => {
  try {
    const resources = {
      aiResources: [
        {
          category: "Machine Learning Basics",
          link: "https://www.coursera.org/learn/machine-learning",
          provider: "Coursera",
          level: "Beginner"
        },
        {
          category: "Deep Learning Specialization",
          link: "https://www.deeplearning.ai/",
          provider: "DeepLearning.AI",
          level: "Intermediate"
        }
      ],
      developmentResources: [
        {
          category: "Web Development",
          link: "https://www.freecodecamp.org/learn/responsive-web-design/",
          provider: "FreeCodeCamp",
          level: "Beginner"
        },
        {
          category: "Full Stack Development",
          link: "https://www.theodinproject.com/",
          provider: "The Odin Project",
          level: "Intermediate"
        }
      ],
      designResources: [
        {
          category: "UI/UX Design Principles",
          link: "https://www.interaction-design.org/courses/",
          provider: "Interaction Design Foundation",
          level: "Beginner"
        }
      ]
    };

    res.status(200).json(resources);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔍 SEARCH FOR TOOLS AND CONTENT
router.post("/search", authMiddleware, async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ message: "Search query is required" });
    }

    // Intelligent search based on keywords
    const results = {
      query: query.toLowerCase(),
      suggestedTools: [],
      resources: []
    };

    // Keyword-based recommendations
    const keywordMap = {
      explain: "chatGPT",
      explain: "chatGPT",
      summarize: "chatGPT",
      write: "chatGPT",
      generate: "chatGPT",
      presentation: "gamma",
      slides: "gamma",
      design: "figma",
      ui: "figma",
      ux: "figma",
      prototype: "figma",
      app: "lovable",
      code: "lovable",
      graphic: "canva",
      visual: "canva",
      image: "canva",
      develop: "github",
      collaborate: "github",
      repository: "github",
      interview: "leetcode",
      algorithm: "leetcode",
      practice: "leetcode"
    };

    // Find matching tools
    for (const [keyword, tool] of Object.entries(keywordMap)) {
      if (query.toLowerCase().includes(keyword)) {
        if (!results.suggestedTools.includes(tool)) {
          results.suggestedTools.push(tool);
        }
      }
    }

    // If no keyword match, suggest based on general categories
    if (results.suggestedTools.length === 0) {
      results.suggestedTools = ["chatGPT", "figma", "lovable"];
    }

    res.status(200).json(results);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
