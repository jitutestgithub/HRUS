module.exports = (req, res, next) => {
  console.log("ADMIN ONLY MIDDLEWARE HIT — req.user =", req.user);

  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.user.role !== "org_admin" && req.user.role !== "hr") {
    return res.status(403).json({ message: "Admin access only" });
  }

  next();
};
