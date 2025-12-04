const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// ROUTES
app.use("/api", require("./index"));

// Debug endpoint list
const listEndpoints = require("express-list-endpoints");
console.log(listEndpoints(app));

app.get("/", (req, res) => {
  res.send("HRMS SaaS Backend Running...");
});

app.listen(process.env.PORT || 5000, () => {
  console.log("Server running on port", process.env.PORT || 5000);
});
