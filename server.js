const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");  // ✅ added
const employeeRoutes = require("./routes/employees");
const workLogRoutes = require("./routes/worklogs");

const app = express();

// ===== Middleware =====
app.use(express.json());
app.use(cors()); // ✅ allow React frontend to call backend

// ===== MongoDB Connection =====
const mongoURI = process.env.MONGODB_URI;

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

// ===== Routes =====
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
