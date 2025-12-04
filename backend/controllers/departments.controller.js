const pool = require("../config/db");

exports.getDepartments = async (req, res) => {
  try {
    const orgId = req.user.organization_id;

    const [rows] = await pool.query(
      "SELECT * FROM departments WHERE organization_id = ?",
      [orgId]
    );

    return res.json(rows);
  } catch (err) {
    console.error("Error in getDepartments:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.addDepartment = async (req, res) => {
  try {
    const orgId = req.user.organization_id;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Department name required" });
    }

    const [result] = await pool.query(
      "INSERT INTO departments (organization_id, name) VALUES (?, ?)",
      [orgId, name]
    );

    return res.json({ message: "Department added", id: result.insertId });
  } catch (err) {
    console.error("Error in addDepartment:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
