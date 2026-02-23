const mongoose = require('mongoose');

const SupportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['open','closed','pending'], default: 'open' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SupportRequest', SupportSchema);
