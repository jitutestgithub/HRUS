const pool = require("../config/db");
const { hashPassword, comparePassword } = require("../utils/password");
const { generateToken } = require("../utils/jwt");

exports.register = async (req, res) => {
  try {
    const { name, email, password, organizationName } = req.body;

    if (!name || !email || !password || !organizationName) {
      return res.status(400).json({
        message: "Name, email, password, organizationName required",
      });
    }

    // Check if user already exists
    const [existing] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Create organization
    const [org] = await pool.query(
      "INSERT INTO organizations (name) VALUES (?)",
      [organizationName]
    );

    const hash = await hashPassword(password);

    // Insert user
    const [createdUser] = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, organization_id)
       VALUES (?, ?, ?, ?, ?)`,
      [name, email, hash, "org_admin", org.insertId]
    );

    // Insert employee record
    const [createdEmp] = await pool.query(
      `INSERT INTO employees (organization_id, user_id, first_name, email, status)
       VALUES (?, ?, ?, ?, 'active')`,
      [org.insertId, createdUser.insertId, name, email]
    );

    const user = {
      id: createdUser.insertId,
      name,
      email,
      role: "org_admin",
      organization_id: org.insertId,
      employee_id: createdEmp.insertId, // ⭐ correct employee id
    };

    const token = generateToken(user);

    return res.json({ user, token });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.me = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await pool.query(
      "SELECT id, name, email, role, organization_id, created_at FROM users WHERE id = ?",
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = rows[0];

    // ⭐ Get employee_id
    const [emp] = await pool.query(
      "SELECT id FROM employees WHERE user_id = ?",
      [userId]
    );

    user.employee_id = emp.length > 0 ? emp[0].id : null;

    return res.json(user);
  } catch (err) {
    console.error("ME ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (rows.length === 0)
      return res.status(400).json({ message: "Invalid email or password" });

    const user = rows[0];

    const valid = await comparePassword(password, user.password_hash);
    if (!valid)
      return res.status(400).json({ message: "Invalid email or password" });

    // ⭐ Fetch employee record
    const [emp] = await pool.query(
      "SELECT id FROM employees WHERE user_id = ?",
      [user.id]
    );

    // ⭐ Add employee_id to user object
    user.employee_id = emp.length > 0 ? emp[0].id : null;

    // ⭐ Now generate token with employee_id included
    const token = generateToken(user);

    return res.json({ user, token });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
};
