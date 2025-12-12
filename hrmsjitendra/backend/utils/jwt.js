const jwt = require("jsonwebtoken");

exports.generateToken = function (user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      organization_id: user.organization_id,
      employee_id: user.employee_id,  // ⭐ MOST IMPORTANT
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};
