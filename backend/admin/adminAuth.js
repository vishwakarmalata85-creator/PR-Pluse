const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "pulsecare_jwt_secure_super_secret_key_2026";

/**
 * Middleware: Enforces that only authenticated ADMIN users can access the route.
 * Non-admin roles (PATIENT, DOCTOR, PHARMACY) are blocked with 403 Forbidden.
 */
module.exports = function requireAdminAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      error: "Access denied. Admin authorization token required.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        error: `Forbidden: Role '${decoded.role}' does not have Administrator privileges.`,
      });
    }

    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: "Invalid or expired administrator token. Please log in again.",
    });
  }
};
