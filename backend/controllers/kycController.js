const pool = require("../config/db"); // correct DB path

const uploadKyc = async (req, res) => {
  try {
    const { user_id } = req.body;

    const aadhar = req.files?.aadhar?.[0]?.filename || null;
    const pan = req.files?.pan?.[0]?.filename || null;
    const bank_passbook = req.files?.bank_passbook?.[0]?.filename || null;

    const query = `
      INSERT INTO kyc_documents (user_id, aadhar, pan, bank_passbook)
      VALUES (?, ?, ?, ?)
    `;

    const [result] = await pool.query(query, [
      user_id,
      aadhar,
      pan,
      bank_passbook,
    ]);

    return res.json({
      message: "KYC Uploaded Successfully",
      data: result,
    });

  } catch (err) {
    console.error("DB Error:", err);
    return res.status(500).json({ error: "Database error" });
  }
};

module.exports = { uploadKyc };
