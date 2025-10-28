const express = require("express");
const router = express.Router();
const User = require("../models/user");
const { protect, roleCheck } = require("../middleware/auth");
const bcrypt = require("bcryptjs");

// ========================
// Get all users except admin
// ========================
router.get("/", protect, roleCheck("admin"), async (req, res) => {
  try {
    const users = await User.find({ role: "employee" }).select("-password");
    res.json(users);
  } catch (err) {
    console.error("❌ Error fetching users:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// ========================
// Create new user (employee)
// ========================
router.post("/", protect, roleCheck("admin"), async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: "Name and email are required" });
  }

  try {
    // check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password || "default123", 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "employee",
      passwordSet: true, // Mark password as set for direct user creation
    });

    await newUser.save();

    res.status(201).json({
      message: "✅ User created successfully",
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (err) {
    console.error("❌ Error creating user:", err);
    res.status(500).json({ message: "Failed to create user" });
  }
});

// ========================
// Change password (for logged-in users)
// ========================
router.put("/change-password", protect, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Current password and new password are required" });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: "New password must be at least 6 characters long" });
  }

  try {
    // Get user with password field
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("❌ Error changing password:", err);
    res.status(500).json({ message: "Failed to change password" });
  }
});

// ========================
// Delete user (only employees, not admin)
// ========================
router.delete("/:id", protect, roleCheck("admin"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "admin") {
      return res.status(403).json({ message: "Cannot delete admin account" });
    }

    await user.deleteOne();
    res.json({ message: "🗑️ User deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting user:", err);
    res.status(500).json({ message: "Failed to delete user" });
  }
});

module.exports = router;
