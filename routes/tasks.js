const express = require("express");
const router = express.Router();
const Task = require("../models/task");
const { protect, roleCheck } = require("../middleware/auth");

// ========================
// Get all tasks (admin sees all, employees see only their tasks)
// ========================
router.get("/", protect, async (req, res) => {
  try {
    let tasks;
    if (req.user.role === "admin") {
      // Admin sees all tasks
      tasks = await Task.find()
        .populate("assignedTo", "name email")
        .populate("assignedBy", "name")
        .sort({ createdAt: -1 });
    } else {
      // Employee sees only their tasks
      tasks = await Task.find({ assignedTo: req.user._id })
        .populate("assignedBy", "name")
        .sort({ createdAt: -1 });
    }
    res.json(tasks);
  } catch (err) {
    console.error("❌ Error fetching tasks:", err);
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
});

// ========================
// Create new task (admin only)
// ========================
router.post("/", protect, roleCheck("admin"), async (req, res) => {
  const { title, description, assignedTo, dueDate, priority } = req.body;

  if (!title || !assignedTo) {
    return res.status(400).json({ message: "Title and assignedTo are required" });
  }

  try {
    const task = new Task({
      title,
      description,
      assignedTo,
      assignedBy: req.user._id,
      dueDate,
      priority: priority || "medium",
    });

    await task.save();

    // Populate fields before sending response
    await task.populate("assignedTo", "name email");
    await task.populate("assignedBy", "name");

    res.status(201).json({
      message: "✅ Task created successfully",
      task,
    });
  } catch (err) {
    console.error("❌ Error creating task:", err);
    res.status(500).json({ message: "Failed to create task" });
  }
});

// ========================
// Update task (mark as completed or update details)
// ========================
router.put("/:id", protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Employees can only update their own tasks (mark complete)
    if (req.user.role !== "admin" && task.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this task" });
    }

    // Update fields
    if (req.body.completed !== undefined) {
      task.completed = req.body.completed;
      if (req.body.completed) {
        task.completedAt = new Date();
      } else {
        task.completedAt = null;
      }
    }

    // Admin can update all fields
    if (req.user.role === "admin") {
      if (req.body.title) task.title = req.body.title;
      if (req.body.description !== undefined) task.description = req.body.description;
      if (req.body.dueDate !== undefined) task.dueDate = req.body.dueDate;
      if (req.body.priority) task.priority = req.body.priority;
      if (req.body.assignedTo) task.assignedTo = req.body.assignedTo;
    }

    await task.save();
    await task.populate("assignedTo", "name email");
    await task.populate("assignedBy", "name");

    res.json({
      message: "✅ Task updated successfully",
      task,
    });
  } catch (err) {
    console.error("❌ Error updating task:", err);
    res.status(500).json({ message: "Failed to update task" });
  }
});

// ========================
// Delete task (admin only)
// ========================
router.delete("/:id", protect, roleCheck("admin"), async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    await task.deleteOne();
    res.json({ message: "🗑️ Task deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting task:", err);
    res.status(500).json({ message: "Failed to delete task" });
  }
});

module.exports = router;
