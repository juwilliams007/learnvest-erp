const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false }, // Optional - set via invite flow
  role: { type: String, enum: ["admin", "employee"], default: "employee" },
  inviteToken: { type: String },
  inviteTokenExpiry: { type: Date },
  passwordSet: { type: Boolean, default: false },
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
