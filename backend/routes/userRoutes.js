const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// CRUD Routes for Users
router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.post("/", userController.createUser);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);
router.post("/verify-user", userController.verifyUser);

module.exports = router;
