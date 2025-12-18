const express = require("express");
const router = express.Router();

const { verifyToken } = require("../../middlewares/auth");
const employeeAtt = require("../../controllers/employee/attendance.employee.controller");

// ✅ Analytics controller


// ---------------------------
// EMPLOYEE ATTENDANCE ROUTES
// ---------------------------

// 🔹 Today's attendance summary
router.get("/today", verifyToken, employeeAtt.getToday);

// 🔹 Check-In / Check-Out
router.post("/checkin", verifyToken, employeeAtt.checkIn);
router.post("/checkout", verifyToken, employeeAtt.checkOut);

// 🔹 Monthly attendance summary
router.get("/month", verifyToken, employeeAtt.getMonth);

// 🔹 Breaks (Start / End)
router.post("/break-start", verifyToken, employeeAtt.breakStart);
router.post("/break-end", verifyToken, employeeAtt.breakEnd);

// 🔹 All history
router.get("/history", verifyToken, employeeAtt.getHistory);

// 🔹 Attendance for specific date
router.get("/date/:date", verifyToken, employeeAtt.getByDate);

// 🔹 WORK ANALYTICS (New SaaS Feature)

router.get("/my/analytics", verifyToken, employeeAtt.getWorkAnalytics);

module.exports = router;
