const pool = require("../../config/db");

// Admin mark attendance manually
exports.markAttendance = async (req, res) => {
  try {
    const { employee_id, date, check_in, check_out, status } = req.body;

    await pool.query(
      `INSERT INTO attendance_records 
       (employee_id, organization_id, date, check_in, check_out, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [employee_id, req.user.organization_id, date, check_in, check_out, status]
    );

    res.json({ message: "Attendance marked" });
  } catch (err) {
    console.error("ADMIN MARK ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin update existing attendance
exports.updateRecord = async (req, res) => {
  try {
    const id = req.params.id;
    const { check_in, check_out, status } = req.body;

    await pool.query(
      `UPDATE attendance_records 
       SET check_in=?, check_out=?, status=?
       WHERE id=?`,
      [check_in, check_out, status, id]
    );

    res.json({ message: "Updated successfully" });
  } catch (err) {
    console.error("ADMIN UPDATE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin get month calendar

exports.getMonth = async (req, res) => {
  try {
    const { employee_id, year, month } = req.query;
    const orgId = req.user.organization_id;

    if (!employee_id || !year || !month) {
      return res
        .status(400)
        .json({ message: "employee_id, year, month required" });
    }

    const [rows] = await pool.query(
      `SELECT date, status 
       FROM attendance_records 
       WHERE organization_id = ?
         AND employee_id = ? 
         AND YEAR(date) = ? 
         AND MONTH(date) = ?`,
      [orgId, employee_id, year, month]
    );

    const data = rows.map((r) => ({
      date:
        r.date instanceof Date
          ? r.date.toISOString().slice(0, 10) // YYYY-MM-DD
          : r.date,
      status: r.status, // present / absent / late / ...
    }));

    res.json(data);
  } catch (err) {
    console.error("ADMIN MONTH ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.listAll = async (req, res) => {
  try {
    const orgId = req.user.organization_id;

    const [rows] = await pool.query(
      `SELECT ar.*, e.first_name, e.last_name
       FROM attendance_records ar
       JOIN employees e ON ar.employee_id = e.id
       WHERE e.organization_id = ?`,
      [orgId]
    );

    res.json(rows);
  } catch (err) {
    console.error("ADMIN LIST ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

