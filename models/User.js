const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, sparse: true, lowercase: true },
  phoneNumber: { type: String, unique: true, sparse: true },
  password: { type: String },
  // provider supports email/password and Google used by Firebase sync; other values allowed for safe backward compatibility
  provider: { type: String, required: true, default: 'local' },
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