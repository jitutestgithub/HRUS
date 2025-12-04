const pool = require("../config/db");

// ================== APPLY LEAVE (EMPLOYEE) ==================
exports.applyLeave = async (req, res) => {
  try {
    const employeeId = req.user.employee_id;
    const orgId = req.user.organization_id;

    if (!employeeId) {
      return res.status(400).json({ message: "Employee ID missing in token" });
    }

    const { leave_type, from_date, to_date, reason } = req.body;

    if (!leave_type || !from_date || !to_date || !reason) {
      return res.status(400).json({ message: "All fields are required" });
    }

    await pool.query(
      `INSERT INTO leave_requests 
       (organization_id, employee_id, leave_type, start_date, end_date, reason, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [orgId, employeeId, leave_type, from_date, to_date, reason]
    );

    res.json({ message: "Leave request submitted successfully!" });

  } catch (err) {
    console.error("APPLY LEAVE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================== EMPLOYEE - MY LEAVES ==================
exports.myLeaves = async (req, res) => {
  try {
    const employeeId = req.user.employee_id;

    const [rows] = await pool.query(
      `SELECT * 
       FROM leave_requests
       WHERE employee_id = ?
       ORDER BY created_at DESC`,
      [employeeId]
    );

    res.json(rows);

  } catch (err) {
    console.error("MY LEAVES ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================== ADMIN - LIST ALL LEAVE REQUESTS ==================
exports.adminList = async (req, res) => {
  try {
    const orgId = req.user.organization_id;
    const status = req.query.status || "pending";

    const [rows] = await pool.query(
      `SELECT lr.*, e.first_name, e.last_name
       FROM leave_requests lr
       JOIN employees e ON lr.employee_id = e.id
       WHERE lr.organization_id = ? AND lr.status = ?
       ORDER BY lr.created_at DESC`,
      [orgId, status]
    );

    res.json(rows);

  } catch (err) {
    console.error("ADMIN LEAVES ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================== ADMIN - UPDATE LEAVE STATUS ==================
exports.updateStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const { status, remark } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    await pool.query(
      `UPDATE leave_requests
       SET status = ?, remark = ?
       WHERE id = ?`,
      [status, remark || null, id]
    );

    res.json({ message: "Leave status updated" });

  } catch (err) {
    console.error("UPDATE STATUS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
