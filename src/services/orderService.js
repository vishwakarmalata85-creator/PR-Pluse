/**
 * NEXORA PULSE - MEDICINE ORDER & LIVE FULFILLMENT SERVICE
 * Implements order state machine per PATIENT_PRD.md & PATIENT_ARCHITECTURE.md
 */

const STORAGE_KEY_ORDERS = "nexora_patient_orders";

const INITIAL_ORDERS = [
  {
    id: "ord-8812",
    patientId: "usr-pat-001",
    pharmacyId: "pharma-001",
    pharmacyName: "MedPlus 24/7 Super Pharmacy",
    fulfillmentType: "COUNTER_PICKUP",
    pickupToken: "PK-8812",
    status: "READY_FOR_PICKUP",
    items: [
      { drugName: "Cefixime 200mg Generic", quantity: 10, unitPrice: 60.00, isGeneric: true },
      { drugName: "Pantoprazole 40mg Generic", quantity: 7, unitPrice: 32.00, isGeneric: true },
      { drugName: "Paracetamol 650mg Generic", quantity: 6, unitPrice: 14.00, isGeneric: true }
    ],
    subtotal: 106.00,
    deliveryFee: 0.00,
    totalAmount: 106.00,
    estimatedMinutes: 5,
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString()
  }
];

class OrderService {
  constructor() {
    this.init();
  }

  init() {
    const existing = localStorage.getItem(STORAGE_KEY_ORDERS);
    if (!existing) {
      localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(INITIAL_ORDERS));
    }
  }

  getOrders() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_ORDERS);
      return data ? JSON.parse(data) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  }

  saveOrders(orders) {
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
  }

  createOrder({ pharmacyId, pharmacyName, fulfillmentType, deliveryAddress, items, totalAmount }) {
    const orders = this.getOrders();
    const isPickup = fulfillmentType === "COUNTER_PICKUP";
    const newOrder = {
      id: `ord-${Math.floor(1000 + Math.random() * 9000)}`,
      patientId: "usr-pat-001",
      pharmacyId,
      pharmacyName,
      fulfillmentType,
      deliveryAddress: isPickup ? null : (deliveryAddress || "80 Feet Road, Koramangala"),
      pickupToken: isPickup ? `PK-${Math.floor(1000 + Math.random() * 9000)}` : null,
      status: isPickup ? "READY_FOR_PICKUP" : "OUT_FOR_DELIVERY",
      items,
      subtotal: totalAmount,
      deliveryFee: isPickup ? 0 : 30,
      totalAmount: isPickup ? totalAmount : totalAmount + 30,
      estimatedMinutes: isPickup ? 10 : 35,
      createdAt: new Date().toISOString()
    };

    orders.unshift(newOrder);
    this.saveOrders(orders);
    return newOrder;
  }
}

export const orderService = new OrderService();
