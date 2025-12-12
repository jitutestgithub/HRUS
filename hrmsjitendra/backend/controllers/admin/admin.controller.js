const pool = require("../../config/db");

// helper: "2 hrs ago" / "5 days ago"
function timeAgo(date) {
  if (!date) return "";
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHr < 24) return `${diffHr} hrs ago`;
  return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;
}

/* ---------------- Basic Stats (old endpoint) ---------------- */

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

    const [[{ totalLeavePending }]] = await pool.query(
      "SELECT COUNT(*) AS totalLeavePending FROM leave_requests WHERE organization_id = ? AND status = 'pending'",
      [orgId]
    );

    return res.json({
      totalEmployees,
      totalDepartments,
      totalLeavePending,
    });
  } catch (err) {
    console.log("Error fetching stats:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ---------------- Full Advanced Dashboard ---------------- */

exports.getDashboard = async (req, res) => {
  try {
    const orgId = req.user.organization_id;
    const range = req.query.range || "week"; // week | month | quarter

    /* ------- BASIC STATS ------- */

    const [[{ totalEmployees }]] = await pool.query(
      "SELECT COUNT(*) AS totalEmployees FROM employees WHERE organization_id = ?",
      [orgId]
    );

    const [[{ totalDepartments }]] = await pool.query(
      "SELECT COUNT(*) AS totalDepartments FROM departments WHERE organization_id = ?",
      [orgId]
    );

    const [[{ totalLeavePending }]] = await pool.query(
      "SELECT COUNT(*) AS totalLeavePending FROM leave_requests WHERE organization_id = ? AND status = 'pending'",
      [orgId]
    );

    // Attendance records table ke hisaab se: attendance_records + date + status
    const [[{ todaysPresent }]] = await pool.query(
      `SELECT COUNT(DISTINCT employee_id) AS todaysPresent
       FROM attendance_records
       WHERE organization_id = ?
         AND DATE(date) = CURDATE()
         AND status = 'present'`,
      [orgId]
    );

    const todaysAbsent = Math.max(totalEmployees - (todaysPresent || 0), 0);

    /* ------- RECENT ACTIVITY (Employees + Leaves + Departments) ------- */

    const [employeeRows] = await pool.query(
      `SELECT id, first_name, last_name, created_at
       FROM employees
       WHERE organization_id = ?
       ORDER BY created_at DESC
       LIMIT 5`,
      [orgId]
    );

    const [leaveRows] = await pool.query(
      `SELECT lr.id, lr.employee_id, lr.status, lr.created_at,
              e.first_name, e.last_name
       FROM leave_requests lr
       LEFT JOIN employees e ON e.id = lr.employee_id
       WHERE lr.organization_id = ?
       ORDER BY lr.created_at DESC
       LIMIT 5`,
      [orgId]
    );

    const [deptRows] = await pool.query(
      `SELECT id, name, created_at
       FROM departments
       WHERE organization_id = ?
       ORDER BY created_at DESC
       LIMIT 5`,
      [orgId]
    );

    const activities = [];

    // Employees
    employeeRows.forEach((row) => {
      const fullName = [row.first_name, row.last_name].filter(Boolean).join(" ");
      activities.push({
        id: `emp-${row.id}`,
        text: `New employee "${fullName}" added`,
        timeAgo: timeAgo(new Date(row.created_at)),
        type: "employee",
        createdAt: new Date(row.created_at),
      });
    });

    // Leave requests
    leaveRows.forEach((row) => {
      const fullName = [row.first_name, row.last_name].filter(Boolean).join(" ");
      activities.push({
        id: `leave-${row.id}`,
        text: fullName
          ? `Leave request (${row.status}) submitted by ${fullName}`
          : `Leave request (${row.status}) submitted`,
        timeAgo: timeAgo(new Date(row.created_at)),
        type: "leave",
        createdAt: new Date(row.created_at),
      });
    });

    // Departments
    deptRows.forEach((row) => {
      activities.push({
        id: `dept-${row.id}`,
        text: `Department "${row.name}" created/updated`,
        timeAgo: timeAgo(new Date(row.created_at)),
        type: "settings",
        createdAt: new Date(row.created_at),
      });
    });

    activities.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );

    const recentActivity = activities.slice(0, 10).map((a) => ({
      id: a.id,
      text: a.text,
      timeAgo: a.timeAgo,
      type: a.type,
    }));

    /* ------- WEEKLY / MONTHLY OVERVIEW (Attendance) ------- */

    let daysBack = 7;
    if (range === "month") daysBack = 30;
    if (range === "quarter") daysBack = 90;

    // INTERVAL me ? pass karne ki jagah ham safe number inject kar rahe hain (7/30/90)
    const [overviewRows] = await pool.query(
      `SELECT DATE(date) AS day,
              COUNT(DISTINCT employee_id) AS presentCount
       FROM attendance_records
       WHERE organization_id = ?
         AND status = 'present'
         AND date >= DATE_SUB(CURDATE(), INTERVAL ${daysBack} DAY)
       GROUP BY DATE(date)
       ORDER BY day ASC`,
      [orgId]
    );

    const weeklyOverview = overviewRows.map((row) => {
      const d = new Date(row.day);
      const label = d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: range === "week" ? "short" : "numeric",
      });

      return {
        label,
        value: row.presentCount || 0,
      };
    });

    return res.json({
      stats: {
        totalEmployees,
        totalDepartments,
        totalLeavePending,
        todaysPresent: todaysPresent || 0,
        todaysAbsent,
      },
      recentActivity,
      weeklyOverview,
    });
  } catch (err) {
    console.error("Error fetching dashboard:", err);
    res.status(500).json({ message: "Server error" });
  }
};
