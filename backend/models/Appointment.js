const mongoose = require("mongoose");

const AppointmentSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      index: true,
    },
    tokenNumber: {
      type: String,
      default: function () {
        return this.token;
      },
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
    doctorId: {
      type: String,
      required: true,
      index: true,
    },
    doctorName: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      default: "Internal Medicine",
    },
    clinicName: {
      type: String,
      default: "Pulse Care Clinic & Diagnostic Center",
    },
    clinicAddress: {
      type: String,
      default: "80 Feet Rd, 4th Block, Koramangala, Bengaluru",
    },
    date: {
      type: String,
      required: true,
    },
    timeSlot: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      default: function () {
        return this.timeSlot;
      },
    },
    consultationFee: {
      type: Number,
      default: 600,
    },
    symptoms: {
      type: [String],
      default: [],
    },
    vitals: {
      bp: { type: String, default: "120/80 mmHg" },
      pulse: { type: String, default: "72 bpm" },
      temp: { type: String, default: "98.6 °F" },
      spo2: { type: String, default: "99%" },
    },
    status: {
      type: String,
      enum: ["REQUESTED", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
      default: "REQUESTED",
      index: true,
    },
    clinicalNotes: {
      type: String,
      default: "",
    },
    rejectionReason: {
      type: String,
      default: "",
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
  }
);

module.exports = mongoose.model("Appointment", AppointmentSchema);
