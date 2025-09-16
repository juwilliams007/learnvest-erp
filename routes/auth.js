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
    if (user && (await user.matchPassword(password))) {
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

module.exports = router;
