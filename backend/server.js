const express = require("express");
const cors = require("cors");
require("dotenv").config();
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// ⭐ Static uploads path (Move here)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ROUTES
app.use("/api", require("./index"));

app.get("/", (req, res) => {
  res.send("HRMS SaaS Backend Running...");
});

app.listen(process.env.PORT || 5000, () => {
  console.log("Server running on port", process.env.PORT || 5000);
});
