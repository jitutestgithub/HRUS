const pool = require("../config/db");

exports.getStats = async (req, res) => {
  try {
    const orgId = req.user.organization_id;

    const [[{ totalEmployees }]] = await pool.query(
      "SELECT COUNT(*) AS totalEmployees FROM employees WHERE organization_id = ?",
      [orgId]
    );

    const [[{ totalDepartments }]] = await pool.query(
      "SELECT COUNT(*) AS totalDepartments FROM departments WHERE organization_id = ?",
      [orgId]
    );

    const [[{ totalLeavesPending }]] = await pool.query(
      "SELECT COUNT(*) AS totalLeavesPending FROM leave_requests WHERE organization_id = ? AND status = 'pending'",
      [orgId]
    );

    return res.json({
      totalEmployees,
      totalDepartments,
      totalLeavesPending,
    });
  } catch (err) {
    console.log("Error fetching dashboard:", err);
    res.status(500).json({ message: "Server error" });
  }
};
