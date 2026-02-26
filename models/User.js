const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true, lowercase: true },
  password: { type: String },
  provider: { type: String, enum: ['local', 'google'], default: 'local' },
  googleId: { type: String },
  accountStatus: { type: String, enum: ['active','pending','disabled'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", UserSchema);