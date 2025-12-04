const pool = require("../config/db");

// =======================
// Get today's attendance
// =======================
exports.getToday = async (req, res) => {
  try {
    const employeeId = req.user.employee_id;
    const today = new Date().toISOString().slice(0, 10);

    const [rows] = await pool.query(
      "SELECT * FROM attendance_records WHERE employee_id = ? AND date = ?",
      [employeeId, today]
    );

    res.json(rows[0] || null);
  } catch (err) {
    console.error("getToday ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// =======================
// Check-in
// =======================
exports.checkIn = async (req, res) => {
  try {
    const employeeId = req.user.employee_id;
    const orgId = req.user.organization_id;
    const today = new Date().toISOString().slice(0, 10);

    const [exists] = await pool.query(
      "SELECT id FROM attendance_records WHERE employee_id = ? AND date = ?",
      [employeeId, today]
    );

    if (exists.length > 0) {
      return res.status(400).json({ message: "Already checked in today" });
    }

    await pool.query(
      `INSERT INTO attendance_records 
        (organization_id, employee_id, date, check_in, status) 
       VALUES (?, ?, ?, NOW(), 'present')`,
      [orgId, employeeId, today]
    );

    res.json({ message: "Checked in" });
  } catch (err) {
    console.error("checkIn ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// =======================
// Check-out
// =======================
exports.checkOut = async (req, res) => {
  try {
    const employeeId = req.user.employee_id;
    const today = new Date().toISOString().slice(0, 10);

    const [rec] = await pool.query(
      "SELECT * FROM attendance_records WHERE employee_id = ? AND date = ?",
      [employeeId, today]
    );

    if (rec.length === 0) {
      return res.status(400).json({ message: "No check-in found" });
    }

    if (rec[0].check_out) {
      return res.status(400).json({ message: "Already checked out" });
    }

    await pool.query(
      `UPDATE attendance_records 
       SET check_out = NOW(),
           work_hours = TIMESTAMPDIFF(HOUR, check_in, NOW())
       WHERE id = ?`,
      [rec[0].id]
    );

    res.json({ message: "Checked out" });
  } catch (err) {
    console.error("checkOut ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// =======================
// Employee monthly calendar
// =======================
exports.getMonth = async (req, res) => {
  try {
    const employeeId = req.user.employee_id;
    const { year, month } = req.query;

    const monthStr = month.padStart(2, "0");
    const start = `${year}-${monthStr}-01`;
    const end = `${year}-${monthStr}-31`;

    const [rows] = await pool.query(
      `SELECT 
          date,
          status
       FROM attendance_records
       WHERE employee_id = ?
         AND date BETWEEN ? AND ?
       ORDER BY date`,
      [employeeId, start, end]
    );

    res.json(rows);
  } catch (err) {
    console.error("getMonth ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// =======================
// Admin monthly calendar
// =======================
exports.adminMonth = async (req, res) => {
  try {
    const { employee_id, year, month } = req.query;

    const monthStr = month.padStart(2, "0");
    const start = `${year}-${monthStr}-01`;
    const end = `${year}-${monthStr}-31`;

    const [rows] = await pool.query(
      `SELECT 
          date,
          status
       FROM attendance_records
       WHERE employee_id = ?
         AND date BETWEEN ? AND ?
       ORDER BY date`,
      [employee_id, start, end]
    );

    res.json(rows);
  } catch (err) {
    console.error("adminMonth ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
