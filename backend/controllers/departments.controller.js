const pool = require("../config/db");

// ===========================
// GET ALL DEPARTMENTS
// ===========================
exports.getDepartments = async (req, res) => {
  try {
    const orgId = req.user.organization_id;

    const [rows] = await pool.query(
      "SELECT * FROM departments WHERE organization_id = ? ORDER BY id DESC",
      [orgId]
    );

    return res.json(rows);
  } catch (err) {
    console.error("Error in getDepartments:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ===========================
// ADD DEPARTMENT
// ===========================
exports.addDepartment = async (req, res) => {
  try {
    const orgId = req.user.organization_id;
    const { name } = req.body;

    if (!name)
      return res.status(400).json({ message: "Department name required" });

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

// ===========================
// UPDATE DEPARTMENT
// ===========================
exports.updateDepartment = async (req, res) => {
  try {
    const orgId = req.user.organization_id;
    const { id } = req.params;
    const { name } = req.body;

    if (!name)
      return res.status(400).json({ message: "Department name required" });

    // Check if department exists
    const [existing] = await pool.query(
      "SELECT * FROM departments WHERE id = ? AND organization_id = ?",
      [id, orgId]
    );

    if (existing.length === 0)
      return res.status(404).json({ message: "Department not found" });

    await pool.query(
      "UPDATE departments SET name = ? WHERE id = ? AND organization_id = ?",
      [name, id, orgId]
    );

    return res.json({ message: "Department updated" });
  } catch (err) {
    console.error("Error in updateDepartment:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ===========================
// DELETE DEPARTMENT
// ===========================
exports.deleteDepartment = async (req, res) => {
  try {
    const orgId = req.user.organization_id;
    const { id } = req.params;

    // Check exists
    const [exists] = await pool.query(
      "SELECT id FROM departments WHERE id = ? AND organization_id = ?",
      [id, orgId]
    );

    if (exists.length === 0)
      return res.status(404).json({ message: "Department not found" });

    await pool.query(
      "DELETE FROM departments WHERE id = ? AND organization_id = ?",
      [id, orgId]
    );

    return res.json({ message: "Department deleted" });
  } catch (err) {
    console.error("Error in deleteDepartment:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
