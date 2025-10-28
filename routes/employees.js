const express = require("express");
const router = express.Router();
const Employee = require("../models/employee");
const User = require("../models/user");
const { protect, roleCheck } = require("../middleware/auth");
const crypto = require("crypto");

// Get employees (admin only)
router.get("/", protect, roleCheck("admin"), async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (err) {
    console.error("❌ Error fetching employees:", err);
    res.status(500).json({ message: err.message });
  }
});

// Add employee (admin only) - generates invite token
router.post("/", protect, roleCheck("admin"), async (req, res) => {
  const { name, email, position } = req.body;

  console.log("📩 Incoming employee payload:", req.body);

  if (!name || !email || !position) {
    return res.status(400).json({
      message: "Name, email, and position are required",
    });
  }

  try {
    // Check duplicates
    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      return res.status(400).json({ message: "Employee with this email already exists" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // Generate invite token (valid for 7 days)
    const inviteToken = crypto.randomBytes(32).toString("hex");
    const inviteTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Create User first (without password)
    console.log(`👉 Creating user for ${email}`);
    const newUser = new User({
      name,
      email,
      password: null, // No password yet
      role: "employee",
      inviteToken,
      inviteTokenExpiry,
      passwordSet: false,
    });

    const savedUser = await newUser.save();
    console.log(`✅ User created for ${email}`);

    // Then create Employee profile
    const employee = new Employee({ name, email, position });
    const savedEmployee = await employee.save();
    console.log(`✅ Employee profile created for ${email}`);

    // Generate invite link
    const inviteLink = `${process.env.FRONTEND_URL || "http://localhost:3000"}/setup-password?token=${inviteToken}`;

    res.status(201).json({
      message: "Employee created successfully. Share the invite link with them.",
      employee: savedEmployee,
      user: {
        _id: savedUser._id,
        email: savedUser.email,
        role: savedUser.role,
      },
      inviteLink,
      inviteTokenExpiry,
    });
  } catch (err) {
    console.error("❌ Error in /employees route:", err);
    res.status(400).json({ message: err.message });
  }
});

// Resend invite link (admin only)
router.post("/resend-invite/:userId", protect, roleCheck("admin"), async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.passwordSet) {
      return res.status(400).json({ message: "User has already set their password" });
    }

    // Generate new invite token (valid for 7 days)
    const inviteToken = crypto.randomBytes(32).toString("hex");
    const inviteTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    user.inviteToken = inviteToken;
    user.inviteTokenExpiry = inviteTokenExpiry;
    await user.save();

    const inviteLink = `${process.env.FRONTEND_URL || "http://localhost:3000"}/setup-password?token=${inviteToken}`;

    res.json({
      message: "Invite link regenerated successfully",
      inviteLink,
      inviteTokenExpiry,
    });
  } catch (err) {
    console.error("❌ Error resending invite:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
