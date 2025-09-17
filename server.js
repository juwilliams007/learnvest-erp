const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();   // ✅ Load variables from .env

const app = express();

// ===== Middleware =====
app.use(express.json());

// ✅ Allow frontend from localhost:3000 AND deployed frontend
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://learnvest-erp-frontend.onrender.com" // correct frontend URL
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// ===== Route Imports (all lowercase filenames) =====
const userRoutes = require("./routes/user");
const employeeRoutes = require("./routes/employees");
const workLogRoutes = require("./routes/worklogs");
const authRoutes = require("./routes/auth");
const attendanceRoutes = require("./routes/attendance");

// ===== MongoDB Connection =====
const mongoURI = process.env.MONGODB_URI;
if (!mongoURI) {
  console.error("❌ MongoDB URI not provided!");
  process.exit(1);
}

mongoose
  .connect(mongoURI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// ===== API Index =====
app.get("/api", (req, res) => {
  res.json({
    status: "ok",
    service: "learnvest-erp",
    endpoints: [
      "/api/auth",
      "/api/users",
      "/api/employees",
      "/api/worklogs",
      "/api/attendance",
    ],
  });
});

// ===== Routes =====
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/worklogs", workLogRoutes);
app.use("/api/attendance", attendanceRoutes);

// ===== Test Route =====
app.get("/", (req, res) => {
  res.send("Learnvest ERP API is running...");
});

// ===== Server Start =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
