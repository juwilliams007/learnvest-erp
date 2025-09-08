const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const WorkLog = require("../models/worklog");

// Create a new log (Clock In + tasks + next day plan)
router.post("/", async (req, res) => {
  try {
    const { employeeId, clockIn, clockOut, tasks, nextDayPlan } = req.body;

    const workLog = new WorkLog({
      employeeId,   // ✅ let Mongoose handle casting
      clockIn,
      clockOut,
      tasks,
      nextDayPlan,
    });

    await workLog.save();
    res.status(201).json(workLog);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});



// Get all logs
router.get("/", async (req, res) => {
  try {
    const logs = await WorkLog.find().populate("employeeId", "name email");
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get logs for one employee
router.get("/employee/:employeeId", async (req, res) => {
  try {
    const logs = await WorkLog.find({ employeeId: req.params.employeeId })
      .sort({ date: -1 })
      .populate("employeeId", "name email");
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update log (e.g. add clockOut, add tasks, update nextDayPlan)
router.put("/:id", async (req, res) => {
  try {
    const log = await WorkLog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!log) return res.status(404).json({ message: "Log not found" });
    res.json(log);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete log
router.delete("/:id", async (req, res) => {
  try {
    const log = await WorkLog.findByIdAndDelete(req.params.id);
    if (!log) return res.status(404).json({ message: "Log not found" });
    res.json({ message: "Log deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete all logs
router.delete("/", async (req, res) => {
  try {
    await WorkLog.deleteMany({});
    res.json({ message: "All worklogs deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
