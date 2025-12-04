const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middlewares/auth");
const employeeAtt = require("../controllers/attendance.employee.controller");

// Today summary
router.get("/today", verifyToken, employeeAtt.getToday);

// Check in / out
router.post("/checkin", verifyToken, employeeAtt.checkIn);
router.post("/checkout", verifyToken, employeeAtt.checkOut);

// Month wise
router.get("/month", verifyToken, employeeAtt.getMonth);

// 🔹 Break routes yahin rakho
router.post("/break-start", verifyToken, employeeAtt.breakStart);
router.post("/break-end", verifyToken, employeeAtt.breakEnd);

router.get("/history", verifyToken, employeeAtt.getHistory);
router.get("/date/:date", verifyToken, employeeAtt.getByDate);

module.exports = router;
