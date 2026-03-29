const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true, lowercase: true },
  password: { type: String },
  provider: { type: String, enum: ['local', 'google', 'firebase'], default: 'local' },
  googleId: { type: String },
<<<<<<< HEAD
  // ✅ Gmail OAuth tokens
  googleAccessToken: { type: String },
  googleRefreshToken: { type: String },
  googleTokenExpiry: { type: Date },
  accountStatus: { type: String, enum: ['active','pending','disabled'], default: 'active' },
=======
  firebaseUID: { type: String, unique: true, sparse: true },
  accountStatus: { type: String, enum: ['active', 'pending', 'disabled'], default: 'active' },
  lastLogin: { type: Date },
>>>>>>> 70f6487315ffb4abfc0e2702cd18e56bbd3189d9
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", UserSchema);