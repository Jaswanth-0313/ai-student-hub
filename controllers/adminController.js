const User = require('../models/User');
const mongoose = require('mongoose');

async function getStats(req, res) {
  try {
    // require admin
    const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase();
    const requesterId = req.userId;
    if (!requesterId) return res.status(401).json({ message: 'Unauthorized' });
    const requester = await User.findById(requesterId).select('email');
    if (!requester || requester.email !== adminEmail) return res.status(403).json({ message: 'Forbidden' });

    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ accountStatus: 'active' });
    const serverTime = new Date();
    const dbState = mongoose.connection.readyState;
    const dbStatus = dbState === 1 ? 'connected' : (dbState === 2 ? 'connecting' : 'disconnected');

    return res.json({ totalUsers, activeUsers, serverTime, dbStatus });
  } catch (err) {
    console.error('admin.getStats error', err);
    return res.status(500).json({ message: err.message });
  }
}

module.exports = { getStats };
