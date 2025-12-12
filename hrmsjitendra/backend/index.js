// backend/index.js
const express = require("express");
const router = express.Router();

// Import all route modules
const authRoutes = require("./routes/auth.routes.js");
const employeeRoutes = require("./routes/employee/employees.routes.js");
const departmentRoutes = require("./routes/employee/departments.routes.js");
const leaveRoutes = require("./routes/employee/leaves.routes.js");

//hr
const hrRoutes = require("./routes/hr/hr.routes.js");

// API prefixes
router.use("/auth", authRoutes);
router.use("/employees", employeeRoutes);
router.use("/departments", departmentRoutes);
router.use("/leaves", leaveRoutes);

// HR routes
router.use("/hr", hrRoutes);

// Employee-specific extra routes
router.use("/employee", require("./routes/employee/employee.profile.routes.js"));
router.use("/attendance", require("./routes/employee/attendance.employee.routes.js"));
router.use("/employee", require("./routes/employee/employee.upload.routes.js"));

// Admin routes
router.use("/admin", require("./routes/admin/admin.routes.js"));
router.use("/admin/attendance", require("./routes/admin/attendance.admin.routes.js"));

// Organization routes
router.use("/organizations", require("./routes/admin/organizations.routes.js"));

module.exports = router;
