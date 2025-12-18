// controllers/employeeController.js

const pool = require("../../config/db");
const { hashPassword } = require("../../utils/password");
const { sendMail } = require("../../utils/mailer");


// ---------------------------------------------------------
// 1️⃣ GET ALL EMPLOYEES
// ---------------------------------------------------------
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


// ---------------------------------------------------------
// 2️⃣ ADD EMPLOYEE + CREATE USER + SEND EMAIL
// ---------------------------------------------------------
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

    // Check if email exists
    const [existing] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Generate temp password
    const tempPassword = Math.random().toString(36).slice(-8);
    const passwordHash = await hashPassword(tempPassword);

    // Insert user
    const [userResult] = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, organization_id)
       VALUES (?, ?, ?, 'employee', ?)`,
      [`${first_name} ${last_name}`, email, passwordHash, orgId]
    );

    const userId = userResult.insertId;

    // Insert employee
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

    // Send email
    const loginUrl = process.env.APP_URL || "http://localhost:3000/login";

    const html = `
      <h2>Welcome ${first_name}!</h2>
      <p>Your account has been created successfully.</p>

      <h3>Login Details:</h3>
      <p><b>Email:</b> ${email}</p>
      <p><b>Temporary Password:</b> ${tempPassword}</p>
      <p><b>Login URL:</b> <a href="${loginUrl}">${loginUrl}</a></p>

      <h3>Job Details:</h3>
      <p><b>Designation:</b> ${designation}</p>
      <p><b>Department:</b> ${department_id}</p>
      <p><b>Join Date:</b> ${join_date}</p>

      <br/>
      <p>Regards,<br/>HR Team</p>
    `;

    await sendMail(email, "Welcome to the Company", html);

    return res.json({
      message: "Employee added & email sent",
      employee_id: empResult.insertId,
      user_id: userId,
    });

  } catch (err) {
    console.error("addEmployee ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};


// ---------------------------------------------------------
// 3️⃣ GET EMPLOYEE BY ID
// ---------------------------------------------------------
exports.getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;                 // 🔑 URL se ID
    const orgId = req.user.organization_id;

    console.log("EMPLOYEE ID:", id);           // 🧪 test

    const [rows] = await pool.query(
      `SELECT 
         e.id,
         e.first_name,
         e.last_name,
         e.email,
         e.phone,
         d.name AS department_name,
         e.designation,
         e.join_date,
         e.status
       FROM employees e
       LEFT JOIN departments d ON e.department_id = d.id
       WHERE e.id = ? AND e.organization_id = ?`,
      [id, orgId]
    );

    if (rows.length === 0)
      return res.status(404).json({ message: "Employee not found" });

    res.json(rows[0]);
  } catch (err) {
    console.error("GET EMPLOYEE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};



// ---------------------------------------------------------
// 4️⃣ UPDATE EMPLOYEE
// ---------------------------------------------------------
exports.updateEmployee = async (req, res) => {
  try {
    const id = req.params.id;
    const orgId = req.user.organization_id;

    await pool.query(
      `UPDATE employees SET ? WHERE id = ? AND organization_id = ?`,
      [req.body, id, orgId]
    );

    return res.json({ message: "Employee updated successfully" });
  } catch (err) {
    console.error("updateEmployee ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};


// ---------------------------------------------------------
// 5️⃣ DELETE EMPLOYEE
// ---------------------------------------------------------
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
