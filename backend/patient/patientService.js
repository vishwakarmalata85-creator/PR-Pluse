/**
 * NEXORA PULSECARE - PATIENT SERVICE
 * Dedicated data access for Patient Orders, Prescriptions, and Health Records.
 */

const fs = require("fs");
const path = require("path");
const store = require("../store");

const PATIENT_ORDERS_DIR = path.join(__dirname, "..", "data", "orders", "patient");
if (!fs.existsSync(PATIENT_ORDERS_DIR)) {
  fs.mkdirSync(PATIENT_ORDERS_DIR, { recursive: true });
}

class PatientService {
  async getPatientOrders(patientId) {
    const orders = await store.getOrdersList({ patientId });
    // Write copy to patient data folder for easy file inspection
    this.exportPatientOrdersToFile(patientId, orders);
    return orders;
  }

  async getPatientOrderById(patientId, orderId) {
    const order = await store.findOrderById(orderId);
    if (!order) return null;
    if (patientId && order.patientId !== patientId) return null;
    return order;
  }

  async createPatientOrder(orderData) {
    const newOrder = await store.addOrder(orderData);
    this.saveIndividualPatientOrder(newOrder);
    return newOrder;
  }

  exportPatientOrdersToFile(patientId, orders) {
    try {
      const filePath = path.join(PATIENT_ORDERS_DIR, `${patientId || "all"}_orders.json`);
      fs.writeFileSync(filePath, JSON.stringify(orders, null, 2), "utf8");
    } catch (e) {
      console.warn("Could not save patient orders to file:", e.message);
    }
  }

  saveIndividualPatientOrder(order) {
    try {
      const filePath = path.join(PATIENT_ORDERS_DIR, `${order.orderNumber || order.id}.json`);
      fs.writeFileSync(filePath, JSON.stringify(order, null, 2), "utf8");
    } catch (e) {
      console.warn("Could not save single patient order file:", e.message);
    }
  }
}

module.exports = new PatientService();
