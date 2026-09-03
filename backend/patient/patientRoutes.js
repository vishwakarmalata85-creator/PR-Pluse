const express = require("express");
const router = express.Router();
const patientController = require("./patientController");

// Dedicated Patient Endpoints
router.get("/orders", patientController.getOrders);
router.get("/orders/:id", patientController.getOrderById);
router.post("/orders", patientController.createOrder);

module.exports = router;
