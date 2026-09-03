const store = require("../store");
const notificationService = require("../services/notificationService");

// GET /api/orders
exports.getOrders = async (req, res) => {
  try {
    const { patientId, pharmacyId, status } = req.query;
    const filter = {};
    if (patientId) filter.patientId = patientId;
    if (pharmacyId) filter.pharmacyId = pharmacyId;
    if (status) filter.status = status;

    const orders = await store.getOrdersList(filter);
    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// GET /api/orders/my (Patient orders)
exports.getMyOrders = async (req, res) => {
  try {
    const patientId = req.query.patientId || req.user?.id || "usr-pat-001";
    const orders = await store.getOrdersList({ patientId });
    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// GET /api/pharmacy/orders (Pharmacy incoming order queue)
exports.getPharmacyOrders = async (req, res) => {
  try {
    const pharmacyId = req.query.pharmacyId || req.user?.id || "usr-pharma-001";
    const orders = await store.getOrdersList({ pharmacyId });
    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// GET /api/orders/:id
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await store.findOrderById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: `Order #${id} not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// POST /api/orders (Patient places medicine order)
exports.createOrder = async (req, res) => {
  try {
    let {
      patientId,
      patientName,
      pharmacyId,
      pharmacyName,
      doctorId,
      doctorName,
      medicines,
      items,
      subtotal,
      deliveryFee,
      totalAmount,
      fulfillmentType,
      deliveryAddress,
    } = req.body;

    const chosenItems = medicines || items || [
      { name: "Generic Bioequivalent Meds", quantity: 1, price: Number(totalAmount) || 106, isGeneric: true },
    ];

    const finalSubtotal = Number(subtotal) || Number(totalAmount) || 106;
    const isPickup = fulfillmentType !== "HOME_DELIVERY";
    const finalDeliveryFee = isPickup ? 0 : Number(deliveryFee) || 30;
    const finalTotal = finalSubtotal + finalDeliveryFee;

    const orderNum = Math.floor(1000 + Math.random() * 9000);
    const tokenNum = Math.floor(1000 + Math.random() * 9000);

    const newOrder = await store.addOrder({
      id: req.body.id || `ord-${orderNum}`,
      orderNumber: `ORD-${orderNum}`,
      patientId: patientId || req.user?.id || "usr-pat-001",
      patientName: patientName || req.user?.fullName || "Anil Kumar Verma",
      pharmacyId: pharmacyId || "usr-pharma-001",
      pharmacyName: pharmacyName || "MedPlus 24/7 Super Pharmacy",
      doctorId: doctorId || "usr-doc-001",
      doctorName: doctorName || "Dr. Vikram Sethi, MD",
      medicines: chosenItems,
      items: chosenItems,
      subtotal: finalSubtotal,
      deliveryFee: finalDeliveryFee,
      totalAmount: finalTotal,
      status: "PLACED",
      fulfillmentType: isPickup ? "COUNTER_PICKUP" : "HOME_DELIVERY",
      pickupToken: isPickup ? `PK-${tokenNum}` : null,
      deliveryAddress: isPickup ? null : (deliveryAddress || "80 Feet Road, Koramangala, Bengaluru"),
      estimatedMinutes: isPickup ? 10 : 35,
      created_at: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    console.log(`📦 [ORDER PLACED] ${newOrder.orderNumber} for ${newOrder.patientName} at ${newOrder.pharmacyName} (₹${newOrder.totalAmount})`);

    return res.status(201).json({
      success: true,
      message: `Medicine order ${newOrder.orderNumber} placed successfully!`,
      order: newOrder,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// PATCH /api/pharmacy/orders/:id/status or PATCH /api/orders/:id/status
exports.updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id || req.body.orderId;
    const { status, estimatedMinutes } = req.body;

    if (!orderId || !status) {
      return res.status(400).json({
        success: false,
        error: "Missing orderId or status parameter.",
      });
    }

    const validStatuses = ["PLACED", "CONFIRMED", "PACKED", "READY", "READY_FOR_PICKUP", "OUT_FOR_DELIVERY", "DISPENSED", "COMPLETED", "CANCELLED"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status '${status}'. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const updateFields = {
      status,
      updatedAt: new Date().toISOString(),
    };
    if (estimatedMinutes !== undefined) updateFields.estimatedMinutes = estimatedMinutes;

    const updated = await store.updateOrderStatus(orderId, updateFields);

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: `Order #${orderId} not found.`,
      });
    }

    console.log(`📦 [ORDER STATUS] ${updated.orderNumber} -> ${status}`);

    return res.status(200).json({
      success: true,
      message: `Order #${updated.orderNumber} status updated to ${status}.`,
      order: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// DELETE /api/orders/:id
exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await store.deleteOrderById(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: `Order #${id} not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Order #${deleted.orderNumber || deleted.id} deleted.`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
