const mongoose = require("mongoose");

const ToolIntegrationSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    chatGPT: { 
      enabled: Boolean, 
      apiKey: String,
      connectedAt: Date 
    },
    gamma: { 
      enabled: Boolean, 
      apiKey: String,
      connectedAt: Date 
    },
    figma: { 
      enabled: Boolean, 
      apiKey: String,
      connectedAt: Date 
    },
    lovable: { 
      enabled: Boolean, 
      apiKey: String,
      connectedAt: Date 
    },
    canva: { 
      enabled: Boolean, 
      apiKey: String,
      connectedAt: Date 
    },
    github: { 
      enabled: Boolean, 
      token: String,
      username: String,
      connectedAt: Date 
    },
    leetcode: { 
      enabled: Boolean, 
      username: String,
      connectedAt: Date 
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ToolIntegration", ToolIntegrationSchema);
