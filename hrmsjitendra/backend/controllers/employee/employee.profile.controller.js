const pool = require("../../config/db");
const { comparePassword, hashPassword } = require("../../utils/password");

// ============================
// GET MY PROFILE
// ============================
exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const orgId = req.user.organization_id;

    const [rows] = await pool.query(
      `SELECT 
         e.id,
         e.first_name,
         e.last_name,
         e.email,
         e.phone,
         e.employee_code,
         e.department_id,
         d.name AS department_name,
         e.designation,
         e.join_date,
         e.photo,               -- ⭐ ADD THIS
         e.gender,
         e.dob,
         e.marital_status,
         e.blood_group,
         e.address,
         e.city,
         e.state,
         e.pincode,
         e.emergency_name,
         e.emergency_phone,
         e.relationship
       FROM employees e
       LEFT JOIN departments d ON e.department_id = d.id
       WHERE e.user_id = ? AND e.organization_id = ?`,
      [userId, orgId]
    );

    if (rows.length === 0)
      return res.status(404).json({ message: "Profile not found" });

    return res.json(rows[0]);
  } catch (err) {
    console.error("getMyProfile ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};


// ============================
// UPDATE PROFILE
// ============================
exports.updateMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const orgId = req.user.organization_id;

    const { first_name, last_name, phone, designation } = req.body;

    if (!first_name || !last_name)
      return res.status(400).json({ message: "Name fields are required" });

    await pool.query(
      `UPDATE employees 
       SET first_name = ?, last_name = ?, phone = ?, designation = ?
       WHERE user_id = ? AND organization_id = ?`,
      [first_name, last_name, phone || null, designation || null, userId, orgId]
    );

    await pool.query(
      `UPDATE users SET name = ? WHERE id = ?`,
      [`${first_name} ${last_name}`, userId]
    );

    return res.json({ message: "Profile updated successfully" });

  } catch (err) {
    console.error("updateMyProfile ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};


// ============================
// CHANGE PASSWORD
// ============================
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { current, newPass } = req.body;

    if (!current || !newPass)
      return res.status(400).json({ message: "All fields are required" });

    const [rows] = await pool.query(
      "SELECT password_hash FROM users WHERE id = ?",
      [userId]
    );

    if (rows.length === 0)
      return res.status(404).json({ message: "User not found" });

const validPass = await comparePassword(
  current,
  rows[0].password_hash
);

    if (!validPass)
      return res.status(400).json({ message: "Incorrect current password" });

    const newHash = await hashPassword(newPass);

    await pool.query(
      `UPDATE users SET password_hash = ? WHERE id = ?`,
      [newHash, userId]
    );

    return res.json({ message: "Password changed successfully" });

  } catch (err) {
    console.error("changePassword ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
exports.updateBasicInfo = async (req, res) => {
  try {
    const employeeId = req.user.employee_id;
    const orgId = req.user.organization_id;

    const {
      gender,
      dob,
      marital_status,
      blood_group
    } = req.body;

    await pool.query(
      `UPDATE employees 
       SET gender=?, dob=?, marital_status=?, blood_group=? 
       WHERE id=? AND organization_id=?`,
      [
        gender || null,
        dob || null,
        marital_status || null,
        blood_group || null,
        employeeId,
        orgId
      ]
    );

    return res.json({ message: "Personal information updated successfully" });

  } catch (err) {
    console.error("UPDATE BASIC INFO ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
exports.updateAddress = async (req, res) => {
  try {
    const employeeId = req.user.employee_id;
    const orgId = req.user.organization_id;

    const { address, city, state, pincode } = req.body;

    await pool.query(
      `UPDATE employees 
       SET address=?, city=?, state=?, pincode=? 
       WHERE id=? AND organization_id=?`,
      [
        address || null,
        city || null,
        state || null,
        pincode || null,
        employeeId,
        orgId
      ]
    );

    return res.json({ message: "Address updated successfully" });

  } catch (err) {
    console.error("UPDATE ADDRESS ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
exports.updateEmergencyContact = async (req, res) => {
  try {
    const employeeId = req.user.employee_id;
    const orgId = req.user.organization_id;

    const { emergency_name, emergency_phone, relationship } = req.body;

    await pool.query(
      `UPDATE employees 
       SET emergency_name=?, emergency_phone=?, relationship=? 
       WHERE id=? AND organization_id=?`,
      [
        emergency_name || null,
        emergency_phone || null,
        relationship || null,
        employeeId,
        orgId
      ]
    );

    return res.json({ message: "Emergency contact updated successfully" });

  } catch (err) {
    console.error("UPDATE EMERGENCY ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
