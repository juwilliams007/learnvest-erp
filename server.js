const express = require("express");
const mongoose = require("mongoose");
const employeeRoutes = require("./routes/employees");
const app = express();

app.use(express.json());

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
const workLogRoutes = require("./routes/worklogs");
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
