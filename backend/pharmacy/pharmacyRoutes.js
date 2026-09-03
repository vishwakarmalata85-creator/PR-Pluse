const express = require("express");
const router = express.Router();
const pharmacyController = require("./pharmacyController");

router.get("/orders", pharmacyController.getPharmacyOrders);
router.get("/orders/:id", pharmacyController.getOrderById);
router.patch("/orders/:id/status", pharmacyController.updateOrderStatus);

module.exports = router;
