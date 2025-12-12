// backend/middlewares/hrOnly.js
module.exports = function hrOnly(req, res, next) {
  try {
    const role = req.user?.role;

    // Sirf HR ya Super Admin / Admin ko allow karna ho to:
    if (role === "hr" || role === "admin" || role === "superadmin") {
      return next();
    }

    return res.status(403).json({ message: "HR access only" });
  } catch (err) {
    console.error("hrOnly error:", err);
    return res.status(401).json({ message: "Unauthorized" });
  }
};
