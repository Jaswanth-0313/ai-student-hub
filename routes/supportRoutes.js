const express = require('express');
const router = express.Router();
const SupportRequest = require('../models/SupportRequest');
const authMiddleware = require('../middleware/authMiddleware');

// Submit a support request (public or logged-in)
router.post('/submit', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const validator = require('validator');
    const ticket = new SupportRequest({
      userId: req.userId || null,
      name: validator.escape(String(name).trim()),
      email: validator.normalizeEmail(String(email).trim()),
      subject: validator.escape(String(subject).trim()),
      message: validator.escape(String(message).trim())
    });
    await ticket.save();
    return res.status(201).json({ message: 'Support request submitted', id: ticket._id });
  } catch (err) {
    console.error('support submit error', err);
    return res.status(500).json({ message: err.message });
  }
});

// List user's support tickets
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const tickets = await SupportRequest.find({ userId: req.userId }).sort({ createdAt: -1 });
    return res.json({ tickets });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
