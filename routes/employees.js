const express = require("express");
const router = express.Router();
const Employee = require("../models/employee");
const User = require("../models/user");
const { protect, roleCheck } = require("../middleware/auth");
const bcrypt = require("bcryptjs");

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

// Add employee (admin only, sequential — no transactions)
router.post("/", protect, roleCheck("admin"), async (req, res) => {
  const { name, email, position, password } = req.body;

  console.log("📩 Incoming employee payload:", req.body);

  if (!name || !email || !position || !password) {
    return res.status(400).json({
      message: "Name, email, position, and password are required",
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

    // ✅ Hash password here (since we removed pre("save"))
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create User first
    console.log(`👉 Creating user for ${email}`);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: "employee",
    });

    const savedUser = await newUser.save();
    console.log(`✅ User created for ${email}`);

    // ✅ Then create Employee profile
    const employee = new Employee({ name, email, position });
    const savedEmployee = await employee.save();
    console.log(`✅ Employee profile created for ${email}`);

    res.status(201).json({
      message: "Employee and login account created successfully",
      employee: savedEmployee,
      user: {
        _id: savedUser._id,
        email: savedUser.email,
        role: savedUser.role,
      },
    });
  } catch (err) {
    console.error("❌ Error in /employees route:", err);
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
