const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Authentication & Audit Routes
router.post("/login", authController.login);
router.post("/register", authController.register);
router.post("/logout", authController.logout);
router.get("/login-history", authController.getLoginHistory);

module.exports = router;
