const pool = require("../../config/db");

exports.uploadPhoto = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file)
      return res.status(400).json({ message: "No file uploaded" });

    const photoUrl = `${process.env.APP_URL}/uploads/profile/${req.file.filename}`;

    await pool.query(
      "UPDATE employees SET photo = ? WHERE user_id = ?",
      [photoUrl, userId]
    );

    res.json({ message: "Photo uploaded", photo: photoUrl });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
