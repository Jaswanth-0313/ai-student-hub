const express = require("express");
const router = express.Router();
const ToolIntegration = require("../models/ToolIntegration");
const authMiddleware = require("../middleware/authMiddleware");

// 🔗 CONNECT OR UPDATE TOOL
router.post("/connect/:toolName", authMiddleware, async (req, res) => {
  try {
    const { toolName } = req.params;
    const { apiKey, token, username } = req.body;
    const userId = req.userId;

    // Valid tools list
    const validTools = ["chatGPT", "gamma", "figma", "lovable", "canva", "github", "leetcode"];

    if (!validTools.includes(toolName)) {
      return res.status(400).json({ message: `Invalid tool: ${toolName}` });
    }

    // Find or create tool integration
    let toolIntegration = await ToolIntegration.findOne({ userId });

    if (!toolIntegration) {
      toolIntegration = new ToolIntegration({ userId });
    }

    // Update the specific tool
    if (toolName === "github") {
      toolIntegration[toolName] = {
        enabled: true,
        token,
        username,
        connectedAt: new Date()
      };
    } else if (toolName === "leetcode") {
      toolIntegration[toolName] = {
        enabled: true,
        username,
        connectedAt: new Date()
      };
    } else {
      toolIntegration[toolName] = {
        enabled: true,
        apiKey,
        connectedAt: new Date()
      };
    }

    await toolIntegration.save();

    res.status(200).json({
      message: `${toolName} connected successfully`,
      tool: toolIntegration[toolName]
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔗 DISCONNECT TOOL
router.post("/disconnect/:toolName", authMiddleware, async (req, res) => {
  try {
    const { toolName } = req.params;
    const userId = req.userId;

    const validTools = ["chatGPT", "gamma", "figma", "lovable", "canva", "github", "leetcode"];

    if (!validTools.includes(toolName)) {
      return res.status(400).json({ message: `Invalid tool: ${toolName}` });
    }

    let toolIntegration = await ToolIntegration.findOne({ userId });

    if (!toolIntegration) {
      return res.status(404).json({ message: "No tools connected" });
    }

    // Disable the tool
    toolIntegration[toolName] = {
      enabled: false
    };

    await toolIntegration.save();

    res.status(200).json({
      message: `${toolName} disconnected successfully`
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 📋 GET ALL CONNECTED TOOLS FOR USER
router.get("/mytools", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    let toolIntegration = await ToolIntegration.findOne({ userId });

    if (!toolIntegration) {
      // Return default with all disabled
      toolIntegration = new ToolIntegration({ userId });
      await toolIntegration.save();
    }

    res.status(200).json({
      userId,
      tools: {
        chatGPT: toolIntegration.chatGPT?.enabled || false,
        gamma: toolIntegration.gamma?.enabled || false,
        figma: toolIntegration.figma?.enabled || false,
        lovable: toolIntegration.lovable?.enabled || false,
        canva: toolIntegration.canva?.enabled || false,
        github: toolIntegration.github?.enabled || false,
        leetcode: toolIntegration.leetcode?.enabled || false
      },
      connectedTools: Object.entries({
        chatGPT: toolIntegration.chatGPT,
        gamma: toolIntegration.gamma,
        figma: toolIntegration.figma,
        lovable: toolIntegration.lovable,
        canva: toolIntegration.canva,
        github: toolIntegration.github,
        leetcode: toolIntegration.leetcode
      })
        .filter(([_, tool]) => tool?.enabled)
        .map(([name, _]) => name)
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🚀 REDIRECT TO TOOL (Smart Navigation)
router.get("/redirect/:toolName", authMiddleware, async (req, res) => {
  try {
    const { toolName } = req.params;
    const { query } = req.query; // Search query passed by user

    // Check if tool is connected
    let toolIntegration = await ToolIntegration.findOne({ userId: req.userId });

    if (!toolIntegration || !toolIntegration[toolName]?.enabled) {
      return res.status(400).json({ message: `${toolName} is not connected` });
    }

    // Tool URLs and redirects
    const toolURLs = {
      chatGPT: `https://chat.openai.com?q=${query || ""}`,
      gamma: `https://gamma.app?q=${query || ""}`,
      figma: `https://www.figma.com?q=${query || ""}`,
      lovable: `https://lovable.dev?q=${query || ""}`,
      canva: `https://www.canva.com?q=${query || ""}`,
      github: `https://github.com?q=${query || ""}`,
      leetcode: `https://leetcode.com/problemset/all/?search=${query || ""}`
    };

    res.status(200).json({
      message: `Redirecting to ${toolName}`,
      redirectURL: toolURLs[toolName],
      tool: toolName
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🎯 INTELLIGENT RECOMMENDATION ENGINE
router.post("/recommend", authMiddleware, async (req, res) => {
  try {
    const { userQuery, category } = req.body;

    let recommendations = [];

    // Intelligent routing based on query and category
    if (category === "content" || userQuery.toLowerCase().includes("explain") || userQuery.toLowerCase().includes("explain")) {
      recommendations.push({
        tool: "chatGPT",
        reason: "Perfect for content generation and explanations",
        description: "ChatGPT can provide detailed explanations and generate content"
      });
    }

    if (category === "presentation" || userQuery.toLowerCase().includes("presentation") || userQuery.toLowerCase().includes("slides")) {
      recommendations.push({
        tool: "gamma",
        reason: "Best for creating stunning presentations",
        description: "Gamma specializes in AI-powered presentation creation"
      });
    }

    if (category === "design" || userQuery.toLowerCase().includes("design") || userQuery.toLowerCase().includes("ui")) {
      recommendations.push({
        tool: "figma",
        reason: "Industry-standard for UI/UX design",
        description: "Figma is perfect for prototyping and design collaboration"
      });
      recommendations.push({
        tool: "canva",
        reason: "Great for graphic design",
        description: "Canva makes graphic design simple and accessible"
      });
    }

    if (category === "coding" || userQuery.toLowerCase().includes("code") || userQuery.toLowerCase().includes("app")) {
      recommendations.push({
        tool: "lovable",
        reason: "AI-powered app development",
        description: "Lovable helps you build applications with AI assistance"
      });
      recommendations.push({
        tool: "github",
        reason: "For code hosting and collaboration",
        description: "GitHub is essential for version control and collaboration"
      });
    }

    if (category === "practice" || userQuery.toLowerCase().includes("interview") || userQuery.toLowerCase().includes("leetcode")) {
      recommendations.push({
        tool: "leetcode",
        reason: "Best for coding practice",
        description: "LeetCode has thousands of problems for interview prep"
      });
    }

    res.status(200).json({
      query: userQuery,
      category,
      recommendations
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
