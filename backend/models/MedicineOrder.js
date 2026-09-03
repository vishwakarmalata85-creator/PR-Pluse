const mongoose = require("mongoose");

const MedicineOrderItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    drugName: { type: String },
    quantity: { type: Number, required: true, default: 1 },
    price: { type: Number, required: true, default: 0 },
    unitPrice: { type: Number },
    dosageForm: { type: String, default: "Tablet" },
    instructions: { type: String, default: "As directed by physician" },
    isGeneric: { type: Boolean, default: false },
  },
  { _id: false }
);

const MedicineOrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    patientId: {
      type: String,
      required: true,
      index: true,
    },
    patientName: {
      type: String,
      required: true,
    },
    pharmacyId: {
      type: String,
      required: true,
      index: true,
    },
    pharmacyName: {
      type: String,
      required: true,
    },
    doctorId: {
      type: String,
      default: "usr-doc-001",
    },
    doctorName: {
      type: String,
      default: "Dr. Vikram Sethi, MD",
    },
    medicines: {
      type: [MedicineOrderItemSchema],
      required: true,
      default: [],
    },
    items: {
      type: [MedicineOrderItemSchema],
      default: function () {
        return this.medicines;
      },
    },
    subtotal: {
      type: Number,
      required: true,
      default: 0,
    },
    deliveryFee: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: ["PLACED", "CONFIRMED", "PACKED", "READY", "READY_FOR_PICKUP", "OUT_FOR_DELIVERY", "DISPENSED", "COMPLETED", "CANCELLED"],
      default: "PLACED",
      index: true,
    },
    fulfillmentType: {
      type: String,
      enum: ["COUNTER_PICKUP", "HOME_DELIVERY"],
      default: "COUNTER_PICKUP",
    },
    pickupToken: {
      type: String,
      default: null,
    },
    deliveryAddress: {
      type: String,
      default: null,
    },
    estimatedMinutes: {
      type: Number,
      default: 15,
    },
    created_at: {
      type: String,
      default: () => new Date().toISOString(),
    },
    updatedAt: {
      type: String,
      default: () => new Date().toISOString(),
    },
  },
  {
    timestamps: true,
    collection: "medicine_orders",
  }
);

module.exports = mongoose.model("MedicineOrder", MedicineOrderSchema);
