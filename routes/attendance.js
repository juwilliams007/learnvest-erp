const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const Attendance = require("../models/attendance");

// Clock-in
router.post("/clockin", protect, async (req, res) => {
  try {
    const record = new Attendance({
      user: req.user._id,
      type: "clockin",
      timestamp: new Date(),
    });
    await record.save();
    res.status(201).json({ message: "✅ Clock-in recorded", record });
  } catch (err) {
    console.error("❌ Error recording clock-in:", err);
    res.status(500).json({ message: "Error recording clock-in" });
  }
});

// Clock-out
router.post("/clockout", protect, async (req, res) => {
  try {
    const record = new Attendance({
      user: req.user._id,
      type: "clockout",
      timestamp: new Date(),
    });
    await record.save();
    res.status(201).json({ message: "✅ Clock-out recorded", record });
  } catch (err) {
    console.error("❌ Error recording clock-out:", err);
    res.status(500).json({ message: "Error recording clock-out" });
  }
});

// Get my attendance logs
router.get("/me", protect, async (req, res) => {
  try {
    const records = await Attendance.find({ user: req.user._id })
      .sort({ timestamp: -1 })
      .populate("user", "name email role"); // include basic user info
    res.json(records);
  } catch (err) {
    console.error("❌ Error fetching logs:", err);
    res.status(500).json({ message: "Error fetching logs" });
  }
});

module.exports = router;
