/**
 * NEXORA PULSECARE - MEDICINE ORDER SERVICE
 * Connected to Express + MongoDB Atlas Backend (/api/orders and /api/pharmacy/orders)
 */

const API_BASE = "";

class OrderService {
  async getAuthHeaders() {
    const token = localStorage.getItem("nexora_auth_token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async getOrders(filter = {}) {
    try {
      const queryParams = new URLSearchParams(filter).toString();
      const res = await fetch(`${API_BASE}/api/orders${queryParams ? `?${queryParams}` : ""}`);
      const data = await res.json();
      return data.orders || [];
    } catch (e) {
      console.warn("Failed to fetch live orders, using fallback:", e);
      return [];
    }
  }

  async getMyOrders(patientId = null) {
    try {
      const headers = await this.getAuthHeaders();
      const url = patientId ? `${API_BASE}/api/orders/my?patientId=${encodeURIComponent(patientId)}` : `${API_BASE}/api/orders/my`;
      const res = await fetch(url, { headers });
      const data = await res.json();
      return data.orders || [];
    } catch (e) {
      console.warn("Failed to fetch patient orders:", e);
      return [];
    }
  }

  async getPharmacyOrders(pharmacyId = null) {
    try {
      const headers = await this.getAuthHeaders();
      const url = pharmacyId
        ? `${API_BASE}/api/pharmacy/orders?pharmacyId=${encodeURIComponent(pharmacyId)}`
        : `${API_BASE}/api/pharmacy/orders`;
      const res = await fetch(url, { headers });
      const data = await res.json();
      return data.orders || [];
    } catch (e) {
      console.warn("Failed to fetch pharmacy orders:", e);
      return [];
    }
  }

  async getOrderById(id) {
    try {
      const res = await fetch(`${API_BASE}/api/orders/${id}`);
      const data = await res.json();
      return data.order || null;
    } catch (e) {
      console.warn(`Failed to fetch order #${id}:`, e);
      return null;
    }
  }

  async createOrder({ pharmacyId, pharmacyName, fulfillmentType, deliveryAddress, items, medicines, totalAmount, patientId, patientName }) {
    try {
      const headers = await this.getAuthHeaders();
      const res = await fetch(`${API_BASE}/api/orders`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          patientId,
          patientName,
          pharmacyId,
          pharmacyName,
          fulfillmentType,
          deliveryAddress,
          items: items || medicines,
          medicines: medicines || items,
          totalAmount,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Order creation failed");
      return data.order;
    } catch (e) {
      console.error("Order creation error:", e);
      throw e;
    }
  }

  async updateOrderStatus(orderId, status) {
    try {
      const headers = await this.getAuthHeaders();
      const res = await fetch(`${API_BASE}/api/pharmacy/orders/${orderId}/status`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update order status");
      return data.order;
    } catch (e) {
      console.error(`Order status update error on #${orderId}:`, e);
      throw e;
    }
  }
}

export const orderService = new OrderService();
