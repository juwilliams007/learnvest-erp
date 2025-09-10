const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const employeeRoutes = require("./routes/employees");
const workLogRoutes = require("./routes/worklogs");
const authRoutes = require("./routes/auth");

const app = express();

// ===== Middleware =====
app.use(express.json());
app.use(cors()); // allow React frontend to call backend

// ===== MongoDB Connection =====
const mongoURI = process.env.MONGODB_URI;
if (!mongoURI) {
  console.error("❌ MongoDB URI not provided!");
  process.exit(1);
}

mongoose.connect(mongoURI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// ===== API Index =====
app.get("/api", (req, res) => {
  res.json({
    status: "ok",
    service: "learnvest-erp",
    endpoints: ["/api/employees", "/api/worklogs", "/api/auth"]
  });
});

// ===== Routes =====
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/worklogs", workLogRoutes);

// ===== Test Route =====
app.get("/", (req, res) => {
  res.send("Learnvest ERP API is running...");
});

// ===== Server Start =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
