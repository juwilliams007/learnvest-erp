const mongoose = require("mongoose");

const workLogSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "employee",
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  clockIn: {
    type: Date,
  },
  clockOut: {
    type: Date,
  },
  tasks: [
    {
      type: String,
    },
  ],
  nextDayPlan: {
    type: String,
  },
});

module.exports = mongoose.model("WorkLog", workLogSchema);
