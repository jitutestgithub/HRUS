// backend/routes/hr.routes.js
const express = require("express");
const router = express.Router();

const { verifyToken } = require("../../middlewares/auth");
const hrOnly = require("../../middlewares/hrOnly");

// ✅ Controllers import
const hrDashboard = require("../../controllers/hr/hr.dashboard.controller");
// const hrEmployees = require("../controllers/hr/hr.employees.controller");
// const hrLeaves = require("../controllers/hr/hr.leaves.controller");

// 🔹 HR dashboard summary
router.get("/dashboard", verifyToken, hrOnly, hrDashboard.getDashboard);

// 🔹 HR employees
// router.get("/employees", verifyToken, hrOnly, hrEmployees.list);
// router.get("/employees/:id", verifyToken, hrOnly, hrEmployees.getOne);

// // 🔹 HR leaves
// router.get("/leaves", verifyToken, hrOnly, hrLeaves.list);
// router.post("/leaves/:id/approve", verifyToken, hrOnly, hrLeaves.approve);
// router.post("/leaves/:id/reject", verifyToken, hrOnly, hrLeaves.reject);

module.exports = router;
