// backend/controllers/hr/hr.dashboard.controller.js
const pool = require("../../config/db");

exports.getDashboard = async (req, res) => {
  try {
    const orgId = req.user.organization_id;

    const [[{ totalEmployees }]] = await pool.query(
      "SELECT COUNT(*) AS totalEmployees FROM employees WHERE organization_id = ?",
      [orgId]
    );

    const [[{ pendingLeaves }]] = await pool.query(
      "SELECT COUNT(*) AS pendingLeaves FROM leave_requests WHERE organization_id = ? AND status = 'pending'",
      [orgId]
    );

    const [[{ todayPresent }]] = await pool.query(
      `SELECT COUNT(DISTINCT employee_id) AS todayPresent
       FROM attendance_records
       WHERE organization_id = ? AND date = CURDATE()`,
      [orgId]
    );

    res.json({
      totalEmployees,
      pendingLeaves,
      todayPresent,
    });
  } catch (err) {
    console.error("HR DASHBOARD ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
