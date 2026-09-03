const patientService = require("./patientService");
const orderController = require("../controllers/orderController");

// GET /api/patient/orders
exports.getOrders = async (req, res) => {
  try {
    const patientId = req.query.patientId || req.user?.id || "usr-pat-001";
    const orders = await patientService.getPatientOrders(patientId);
    return res.status(200).json({
      success: true,
      role: "PATIENT",
      patientId,
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

// GET /api/patient/orders/:id
exports.getOrderById = async (req, res) => {
  try {
    const patientId = req.query.patientId || req.user?.id;
    const { id } = req.params;
    const order = await patientService.getPatientOrderById(patientId, id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: `Patient order #${id} not found.`,
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

// POST /api/patient/orders (Place order)
exports.createOrder = orderController.createOrder;
