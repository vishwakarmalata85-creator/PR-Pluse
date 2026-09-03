const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "pulsecare_jwt_secure_super_secret_key_2026";

/**
 * Authentication Middleware: Verifies signed JWT token
 */
module.exports = function authMiddleware(req, res, next) {
  let token = null;

  const authHeader = req.headers["authorization"] || req.headers["x-auth-token"];
  if (authHeader) {
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7).trim();
    } else {
      token = authHeader.trim();
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Access Denied: No authentication token provided.",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: "Authentication Failed: Invalid or expired session token.",
    });
  }
};
