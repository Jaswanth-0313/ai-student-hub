const mongoose = require('mongoose');

const ToolConnectionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  toolName: { type: String, required: true },
  credentials: { type: String }, // encrypted blob
  connected: { type: Boolean, default: true },
  connectedAt: { type: Date, default: Date.now }
}, { timestamps: true });

ToolConnectionSchema.index({ userId: 1, toolName: 1 }, { unique: true });

module.exports = mongoose.model('ToolConnection', ToolConnectionSchema);
