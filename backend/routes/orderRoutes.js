const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");

// Patient & Public Order Routes
router.get("/", orderController.getOrders);
router.get("/my", orderController.getMyOrders);
router.get("/:id", orderController.getOrderById);
router.post("/", orderController.createOrder);
router.patch("/:id/status", orderController.updateOrderStatus);
router.delete("/:id", orderController.deleteOrder);

module.exports = router;
