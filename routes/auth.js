const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/user");

const router = express.Router();

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// ==================
// Register user
// ==================
router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required" });
  }

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "employee",
      passwordSet: true, // Direct registration sets password immediately
    });

    await user.save();

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error("❌ Error in register:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ==================
// Login
// ==================
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check if user has a password
    if (!user.password) {
      return res.status(403).json({
        message: "Password not set. Please use the invite link sent by your admin to set up your password."
      });
    }

    // Verify password
    const isPasswordMatch = await user.matchPassword(password);

    if (isPasswordMatch) {
      // Auto-fix: If user has valid password but passwordSet is false (legacy users), update it
      if (!user.passwordSet) {
        user.passwordSet = true;
        await user.save();
        console.log(`✅ Auto-fixed passwordSet for legacy user: ${user.email}`);
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (err) {
    console.error("❌ Error in login:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ==================
// Setup Password (for new employees via invite token)
// ==================
router.post("/setup-password", async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ message: "Token and password are required" });
  }

  try {
    // Find user with matching token
    const user = await User.findOne({ inviteToken: token });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired invite token" });
    }

    // Check if token has expired
    if (new Date() > user.inviteTokenExpiry) {
      return res.status(400).json({ message: "Invite token has expired. Please request a new one from admin." });
    }

    // Check if password already set
    if (user.passwordSet) {
      return res.status(400).json({ message: "Password has already been set for this account" });
    }

    // Hash and save new password
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.passwordSet = true;
    user.inviteToken = undefined; // Clear the token
    user.inviteTokenExpiry = undefined;

    await user.save();

    res.status(200).json({
      message: "Password set successfully. You can now login.",
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id), // Auto-login
    });
  } catch (err) {
    console.error("❌ Error in setup-password:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
