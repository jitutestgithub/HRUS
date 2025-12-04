const express = require("express");
const router = express.Router();

// Import all route modules
const authRoutes = require("./routes/auth.routes.js");
const employeeRoutes = require("./routes/employees.routes.js");
const departmentRoutes = require("./routes/departments.routes.js");
const leaveRoutes = require("./routes/leaves.routes.js");



// Mount routes
router.use("/auth", authRoutes);
router.use("/employees", employeeRoutes);
router.use("/departments", departmentRoutes);
router.use("/leaves", leaveRoutes);
router.use("/admin", require("./routes/admin.routes.js"));
router.use("/organizations", require("./routes/organizations.routes.js"));
router.use("/attendance", require("./routes/attendance.employee.routes.js"));
router.use("/admin/attendance", require("./routes/attendance.admin.routes.js"));




module.exports = router;
