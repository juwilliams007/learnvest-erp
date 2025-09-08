const express = require("express");
const mongoose = require("mongoose");
const employeeRoutes = require("./routes/employees");
const app = express();

app.use(express.json());

// ===== MongoDB Connection =====
mongoose.connect("mongodb+srv://juwilliams007_db_user:Ic%40ndoit1@learnvest-erp.0lg3fw2.mongodb.net/learnvest_erp?retryWrites=true&w=majority&appName=Learnvest-erp", {
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

