const pool = require("../../config/db");

const isSuperAdmin = (user) => user.role === "superadmin";

/**
 * GET /api/organizations/me
 * Logged-in user's organization details
 */
exports.getMyOrganization = async (req, res) => {
  try {
    const orgId = req.user.organization_id;
    if (!orgId) {
      return res.status(400).json({ message: "No organization linked to user" });
    }

    const [rows] = await pool.query(
      "SELECT * FROM organizations WHERE id = ?",
      [orgId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Organization not found" });
    }

    return res.json(rows[0]);
  } catch (err) {
    console.error("getMyOrganization ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * PUT /api/organizations/me
 * Org admin can update his own organization
 */
exports.updateMyOrganization = async (req, res) => {
  try {
    const orgId = req.user.organization_id;
    if (!orgId) {
      return res
        .status(400)
        .json({ message: "No organization linked to user" });
    }

    const {
      name,
      domain,
      industry,
      description,
      address,
      city,
      state,
      country,
      zipcode,
      contact_email,
      contact_phone,
      logo_url,
      theme_color,
      subscription_plan,
      subscription_status,
      subscription_start,
      subscription_end,
      trial_end,
      billing_cycle,
      user_limit,
      employee_limit,
      status,
      timezone,
      // ✅ NEW
      office_lat,
      office_lng,
    } = req.body;

    await pool.query(
      `UPDATE organizations
       SET 
         name = COALESCE(?, name),
         domain = COALESCE(?, domain),
         industry = COALESCE(?, industry),
         description = COALESCE(?, description),
         address = COALESCE(?, address),
         city = COALESCE(?, city),
         state = COALESCE(?, state),
         country = COALESCE(?, country),
         zipcode = COALESCE(?, zipcode),
         contact_email = COALESCE(?, contact_email),
         contact_phone = COALESCE(?, contact_phone),
         logo_url = COALESCE(?, logo_url),
         theme_color = COALESCE(?, theme_color),
         subscription_plan = COALESCE(?, subscription_plan),
         subscription_status = COALESCE(?, subscription_status),
         subscription_start = COALESCE(?, subscription_start),
         subscription_end = COALESCE(?, subscription_end),
         trial_end = COALESCE(?, trial_end),
         billing_cycle = COALESCE(?, billing_cycle),
         user_limit = COALESCE(?, user_limit),
         employee_limit = COALESCE(?, employee_limit),
         status = COALESCE(?, status),
         timezone = COALESCE(?, timezone),
         -- ✅ NEW FIELDS
         office_lat = COALESCE(?, office_lat),
         office_lng = COALESCE(?, office_lng)
       WHERE id = ?`,
      [
        name,
        domain,
        industry,
        description,
        address,
        city,
        state,
        country,
        zipcode,
        contact_email,
        contact_phone,
        logo_url,
        theme_color,
        subscription_plan,
        subscription_status,
        subscription_start,
        subscription_end,
        trial_end,
        billing_cycle,
        user_limit,
        employee_limit,
        status,
        timezone,
        // ✅ NEW PARAMS
        office_lat,
        office_lng,
        orgId,
      ]
    );

    return res.json({ message: "Organization updated" });
  } catch (err) {
    console.error("updateMyOrganization ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /api/organizations
 * Superadmin: list all organizations
 */
exports.getOrganizations = async (req, res) => {
  try {
    if (!isSuperAdmin(req.user)) {
      return res.status(403).json({ message: "Only superadmin can view all organizations" });
    }

    const [rows] = await pool.query("SELECT * FROM organizations ORDER BY created_at DESC");
    return res.json(rows);
  } catch (err) {
    console.error("getOrganizations ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * POST /api/organizations
 * Superadmin: create an organization manually
 * (optional if you already create org inside register)
 */
exports.createOrganization = async (req, res) => {
  try {
    if (!isSuperAdmin(req.user)) {
      return res
        .status(403)
        .json({ message: "Only superadmin can create organization" });
    }

    const {
      name,
      domain,
      industry,
      description,
      address,
      city,
      state,
      country,
      zipcode,
      contact_email,
      contact_phone,
      logo_url,
      theme_color,
      subscription_plan,
      subscription_status,
      subscription_start,
      subscription_end,
      trial_end,
      billing_cycle,
      user_limit,
      employee_limit,
      status,
      timezone,
      owner_user_id,
      // ✅ NEW
      office_lat,
      office_lng,
    } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ message: "Organization name is required" });
    }

    const [result] = await pool.query(
      `INSERT INTO organizations (
        name,
        domain,
        industry,
        description,
        address,
        city,
        state,
        country,
        zipcode,
        contact_email,
        contact_phone,
        logo_url,
        theme_color,
        subscription_plan,
        subscription_status,
        subscription_start,
        subscription_end,
        trial_end,
        billing_cycle,
        user_limit,
        employee_limit,
        status,
        timezone,
        owner_user_id,
        office_lat,      -- ✅ NEW
        office_lng       -- ✅ NEW
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        name,
        domain,
        industry,
        description,
        address,
        city,
        state,
        country,
        zipcode,
        contact_email,
        contact_phone,
        logo_url,
        theme_color,
        subscription_plan || "free",
        subscription_status || "trial",
        subscription_start || null,
        subscription_end || null,
        trial_end || null,
        billing_cycle || "monthly",
        user_limit || 10,
        employee_limit || 50,
        status || "active",
        timezone || "Asia/Kolkata",
        owner_user_id || null,
        // ✅ NEW VALUES
        office_lat || null,
        office_lng || null,
      ]
    );

    return res.json({ id: result.insertId, message: "Organization created" });
  } catch (err) {
    console.error("createOrganization ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

