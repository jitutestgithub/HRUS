const express = require("express");
const router = express.Router();

const { verifyToken } = require("../../middlewares/auth");
const adminOnly = require("../../middlewares/adminOnly");
const adminAtt = require("../../controllers/admin/attendance.admin.controller");

// Mark attendance
router.post("/mark", verifyToken, adminOnly, adminAtt.markAttendance);

// Update record
router.put("/update/:id", verifyToken, adminOnly, adminAtt.updateRecord);

// Get month-wise attendance
router.get("/month", verifyToken, adminOnly, adminAtt.getMonth);

// List all attendance records
router.get("/list", verifyToken, adminOnly, adminAtt.listAll);

module.exports = router;
