const express = require("express");
const router = express.Router();
const adminController = require("./adminController");
const adminAuth = require("./adminAuth");

// Public Admin Auth
router.post("/login", adminController.login);

// Protected Admin Console Routes (Requires valid Admin JWT token & role === 'ADMIN')
router.use(adminAuth);
router.get("/users", adminController.getUsers);
router.post("/verify-user", adminController.verifyUser);
router.get("/appointments", adminController.getAppointments);
router.get("/login-history", adminController.getLoginHistory);
router.get("/list", adminController.getAdmins);
router.post("/create", adminController.createAdmin);

module.exports = router;
