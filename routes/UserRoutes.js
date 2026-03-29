const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require('validator');
const authMiddleware = require('../middleware/authMiddleware');
const ToolConnection = require('../models/ToolConnection');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');

// Password strength: min 8, 1 upper, 1 lower, 1 number, 1 special
const passwordRegex = /^(?=.{8,}$)(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).*$/;

// ✅ CREATE USER (Signup)
router.post(
  "/create",
  [
    body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').isEmail().withMessage('Invalid email').normalizeEmail(),
    body('password')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .matches(/(?=.*[a-z])/).withMessage('Password must contain a lowercase letter')
      .matches(/(?=.*[A-Z])/).withMessage('Password must contain an uppercase letter')
      .matches(/(?=.*\d)/).withMessage('Password must contain a number')
      .matches(/(?=.*[\W_])/).withMessage('Password must contain a special character')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }
    try {
      const { name, email, password } = req.body;

      // Validation
      if (!name || !email || !password) {
        return res.status(400).json({ message: "Name, email, and password are required" });
      }

      // Only allow Gmail addresses for local signup
      const normalizedEmail = String(email).trim().toLowerCase();
      if (!validator.isEmail(normalizedEmail) || !normalizedEmail.endsWith('@gmail.com')) {
        return res.status(400).json({ message: "Invalid email - please use a @gmail.com address" });
      }

      // Password strength
      if (!passwordRegex.test(password)) {
        return res.status(400).json({ message: "Weak password - must be 8+ chars, include uppercase, lowercase, number and special character" });
      }

      // check if email already exists
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = new User({
        name: String(name).trim(),
        email: normalizedEmail,
        password: hashedPassword,
        provider: 'local'
      });

      await newUser.save();

      // Auto-login: Generate JWT token immediately after signup
      if (!process.env.JWT_SECRET) return res.status(500).json({ message: 'JWT_SECRET not configured on server' });
      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

      // Auto-connect Gmail on signup
      try {
        await ToolConnection.findOneAndUpdate(
          { userId: newUser._id, toolName: 'gmail' },
          { userId: newUser._id, toolName: 'gmail', connected: true, connectedAt: new Date() },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      } catch (e) {
        console.warn('Auto-connect Gmail failed on signup', e.message);
      }

      res.status(201).json({
        message: "Signup successful",
        token,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
        },
      });

    } catch (err) {
      console.error("Signup error:", err);
      res.status(500).json({ message: err.message });
    }
  });
// 🔐 LOGIN USER
router.post(
  "/login",
  [
    body('email').isEmail().withMessage('Invalid email').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }
    try {
      const { email, password } = req.body;

      // Validation
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const normalizedEmail = String(email).trim().toLowerCase();
      if (!validator.isEmail(normalizedEmail) || !normalizedEmail.endsWith('@gmail.com')) {
        return res.status(400).json({ message: "Invalid email - please use a @gmail.com address" });
      }

      // check user
      const user = await User.findOne({ email: normalizedEmail });
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }

      // compare password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      // create token (use env JWT_SECRET in production)
      if (!process.env.JWT_SECRET) return res.status(500).json({ message: 'JWT_SECRET not configured on server' });
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

      // Auto-connect Gmail on login
      try {
        await ToolConnection.findOneAndUpdate(
          { userId: user._id, toolName: 'gmail' },
          { userId: user._id, toolName: 'gmail', connected: true, connectedAt: new Date() },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      } catch (e) {
        console.warn('Auto-connect Gmail failed on login', e.message);
      }

      res.status(200).json({
        message: "Login successful",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });

    } catch (err) {
      console.error("Login error:", err);
      res.status(500).json({ message: err.message });
    }
  });

// ---------- Authenticated routes ----------
// Get current user profile
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Change password (requires current password)
router.put('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validation matches requirements
    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: 'Both current and new passwords are required' });
    if (newPassword.length < 8)
      return res.status(400).json({ message: 'New password must be at least 8 characters' });

    const user = await User.findById(req.userId);
    if (!user)
      return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: 'Current password incorrect' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update profile name
router.put('/update-profile', authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ message: 'Name must be at least 2 characters long' });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = name.trim();
    await user.save();

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ GET ALL USERS
router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("-password"); // hide password
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ✅ GET SINGLE USER
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ✅ UPDATE USER
router.put("/:id", async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).select("-password");

    res.json(updatedUser);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ✅ DELETE USER
router.delete("/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
