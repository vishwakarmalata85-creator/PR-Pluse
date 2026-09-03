const mongoose = require("mongoose");

const LoginHistorySchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      index: true,
    },
    role: {
      type: String,
      default: "UNKNOWN",
    },
    timestamp: {
      type: String,
      default: () => new Date().toISOString(),
      index: true,
    },
    ipAddress: {
      type: String,
      default: "127.0.0.1",
    },
    userAgent: {
      type: String,
      default: "PulseCare Web Client",
    },
    status: {
      type: String,
      enum: [
        "AUTHORIZED",
        "FAILED_INVALID_PASSWORD",
        "FAILED_USER_NOT_FOUND",
        "FAILED_UNVERIFIED",
        "FAILED_REJECTED",
      ],
      default: "AUTHORIZED",
    },
    reason: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("LoginHistory", LoginHistorySchema);
