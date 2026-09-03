const pharmacyService = require("./pharmacyService");

// GET /api/pharmacy/orders
exports.getPharmacyOrders = async (req, res) => {
  try {
    const pharmacyId = req.query.pharmacyId || req.user?.id || "usr-pharma-001";
    const orders = await pharmacyService.getPharmacyOrders(pharmacyId);
    return res.status(200).json({
      success: true,
      role: "PHARMACY",
      pharmacyId,
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

// GET /api/pharmacy/orders/:id
exports.getOrderById = async (req, res) => {
  try {
    const pharmacyId = req.query.pharmacyId || req.user?.id;
    const { id } = req.params;
    const order = await pharmacyService.getPharmacyOrderById(pharmacyId, id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: `Pharmacy order #${id} not found.`,
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

// PATCH /api/pharmacy/orders/:id/status
exports.updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id || req.body.orderId;
    const { status, estimatedMinutes } = req.body;

    if (!orderId || !status) {
      return res.status(400).json({
        success: false,
        error: "Missing orderId or status.",
      });
    }

    const updateFields = { status };
    if (estimatedMinutes !== undefined) updateFields.estimatedMinutes = estimatedMinutes;

    const updated = await pharmacyService.updateOrderStatus(orderId, updateFields);

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: `Order #${orderId} not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Order #${updated.orderNumber || orderId} status updated to ${status}.`,
      order: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
