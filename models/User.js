const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true, lowercase: true },
  password: { type: String },
  provider: { type: String, enum: ['local', 'google', 'firebase'], default: 'local' },
  googleId: { type: String },
  // ✅ Gmail OAuth tokens
  googleAccessToken: { type: String },
  googleRefreshToken: { type: String },
  googleTokenExpiry: { type: Date },
  firebaseUID: { type: String, unique: true, sparse: true },
  accountStatus: { type: String, enum: ['active', 'pending', 'disabled'], default: 'active' },
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", UserSchema);