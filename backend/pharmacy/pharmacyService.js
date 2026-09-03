/**
 * NEXORA PULSECARE - PHARMACY SERVICE
 * Dedicated data access for Pharmacy Orders, Dispensary Queue, and Fulfillment.
 */

const fs = require("fs");
const path = require("path");
const store = require("../store");

const PHARMACY_ORDERS_DIR = path.join(__dirname, "..", "data", "orders", "pharmacy");
if (!fs.existsSync(PHARMACY_ORDERS_DIR)) {
  fs.mkdirSync(PHARMACY_ORDERS_DIR, { recursive: true });
}

class PharmacyService {
  async getPharmacyOrders(pharmacyId) {
    const orders = await store.getOrdersList({ pharmacyId });
    this.exportPharmacyOrdersToFile(pharmacyId, orders);
    return orders;
  }

  async getPharmacyOrderById(pharmacyId, orderId) {
    const order = await store.findOrderById(orderId);
    if (!order) return null;
    if (pharmacyId && order.pharmacyId !== pharmacyId) return null;
    return order;
  }

  async updateOrderStatus(orderId, updateFields) {
    const updated = await store.updateOrderStatus(orderId, updateFields);
    if (updated) {
      this.saveIndividualPharmacyOrder(updated);
    }
    return updated;
  }

  exportPharmacyOrdersToFile(pharmacyId, orders) {
    try {
      const filePath = path.join(PHARMACY_ORDERS_DIR, `${pharmacyId || "all"}_orders.json`);
      fs.writeFileSync(filePath, JSON.stringify(orders, null, 2), "utf8");
    } catch (e) {
      console.warn("Could not save pharmacy orders to file:", e.message);
    }
  }

  saveIndividualPharmacyOrder(order) {
    try {
      const filePath = path.join(PHARMACY_ORDERS_DIR, `${order.orderNumber || order.id}.json`);
      fs.writeFileSync(filePath, JSON.stringify(order, null, 2), "utf8");
    } catch (e) {
      console.warn("Could not save single pharmacy order file:", e.message);
    }
  }
}

module.exports = new PharmacyService();
