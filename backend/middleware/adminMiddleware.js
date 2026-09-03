/**
 * Admin Security Middleware: Verifies authenticated user has ADMIN role
 */
module.exports = function adminMiddleware(req, res, next) {
  if (!req.user || req.user.role !== "ADMIN") {
    return res.status(403).json({
      success: false,
      error: "403 Forbidden: Administrator access privileges required for this endpoint.",
    });
  }
  next();
};
