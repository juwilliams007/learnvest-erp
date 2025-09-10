const express = require("express");
const router = express.Router();
const Employee = require("../models/Employee");
const { protect } = require("../middleware/auth");

// Get employees (protected)
router.get("/", protect, async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add employee (protected)
router.post("/", protect, async (req, res) => {
  const { name, email, position } = req.body;
  try {
    const employee = new Employee({ name, email, position });
    const savedEmployee = await employee.save();
    res.status(201).json(savedEmployee);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
