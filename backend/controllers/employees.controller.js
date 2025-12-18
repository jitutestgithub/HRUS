const pool = require("../config/db");
const { hashPassword } = require("../utils/password"); // ⭐ REQUIRED IMPORT
const { sendMail } = require("../utils/mailer");


exports.getEmployees = async (req, res) => {
  try {
    const orgId = req.user.organization_id;

    const [rows] = await pool.query(
      `SELECT e.*, d.name AS department_name
       FROM employees e
       LEFT JOIN departments d ON e.department_id = d.id
       WHERE e.organization_id = ?
       ORDER BY e.created_at DESC`,
      [orgId]
    );

    return res.json(rows);
  } catch (err) {
    console.error("getEmployees ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.addEmployee = async (req, res) => {
  try {
    const orgId = req.user.organization_id;

    const {
      first_name,
      last_name,
      email,
      phone,
      department_id,
      designation,
      join_date,
      employment_type,
      status
    } = req.body;

    // 1️⃣ Check if email already exists in users table
    const [existing] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // 2️⃣ Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-8); // e.g. "a9xk29qp"
    const passwordHash = await hashPassword(tempPassword);

    // 3️⃣ Create user entry
    const [userResult] = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, organization_id)
       VALUES (?, ?, ?, 'employee', ?)`,
      [`${first_name} ${last_name}`, email, passwordHash, orgId]
    );

    const userId = userResult.insertId;

    // 4️⃣ Create employee entry linked with user_id
    const [empResult] = await pool.query(
      `INSERT INTO employees 
       (organization_id, user_id, first_name, last_name, email, phone, department_id, designation, join_date, employment_type, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orgId,
        userId,
        first_name,
        last_name,
        email,
        phone,
        department_id,
        designation,
        join_date,
        employment_type,
        status || "active"
      ]
    );

 // 👉 SEND JOINING EMAIL
    const loginUrl = process.env.APP_URL || "http://localhost:3000/login";

    const html = `
      <h2>Welcome to the Company, ${first_name}!</h2>
      <p>We are excited to have you join our team.</p>

      <h3>Your Login Details</h3>
      <p><b>Portal:</b> <a href="${loginUrl}">${loginUrl}</a></p>
      <p><b>Email:</b> ${email}</p>
      <p><b>Temporary Password:</b> ${tempPassword}</p>

      <p>Please login and change your password immediately.</p>

      <h3>Your Position Details</h3>
      <p><b>Designation:</b> ${designation}</p>
      <p><b>Department:</b> ${department_id || "N/A"}</p>
      <p><b>Joining Date:</b> ${join_date}</p>

      <br/>
      <p>Regards,<br><b>HR Team</b></p>
    `;

    await sendMail(email, "Welcome to the Company - Login Details", html);

    return res.json({
      message: "Employee added successfully & joining mail sent",
      employee_id: empResult.insertId,
      user_id: userId,
    });

  } catch (err) {
    console.error("addEmployee ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
exports.getEmployeeById = async (req, res) => {
  try {
    const id = req.params.id;
    const orgId = req.user.organization_id;

    const [rows] = await pool.query(
      `SELECT e.*, d.name AS department_name
       FROM employees e
       LEFT JOIN departments d ON e.department_id = d.id
       WHERE e.id = ? AND e.organization_id = ?`,
      [id, orgId]
    );

    if (rows.length === 0)
      return res.status(404).json({ message: "Employee not found" });

    return res.json(rows[0]);
  } catch (err) {
    console.error("getEmployeeById ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    const id = req.params.id;
    const orgId = req.user.organization_id;

    const data = req.body;

    await pool.query(
      `UPDATE employees SET ? WHERE id = ? AND organization_id = ?`,
      [data, id, orgId]
    );

    return res.json({ message: "Employee updated" });
  } catch (err) {
    console.error("updateEmployee ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    const id = req.params.id;
    const orgId = req.user.organization_id;

    await pool.query(
      `DELETE FROM employees WHERE id = ? AND organization_id = ?`,
      [id, orgId]
    );

    return res.json({ message: "Employee deleted" });
  } catch (err) {
    console.error("deleteEmployee ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
exports.getEmployees = async (req, res) => {
  try {
    const orgId = req.user.organization_id;

    const [rows] = await pool.query(
      "SELECT * FROM employees WHERE organization_id = ?",
      [orgId]
    );

    return res.json(rows);
  } catch (err) {
    console.error("EMP ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
