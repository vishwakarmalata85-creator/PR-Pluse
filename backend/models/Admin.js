const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const AdminSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Admin name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Admin email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, "Admin password is required"],
    },
    role: {
      type: String,
      default: "ADMIN",
      immutable: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "SUSPENDED"],
      default: "ACTIVE",
    },
    permissions: {
      type: [String],
      default: [
        "VERIFY_DOCTORS",
        "VERIFY_PHARMACIES",
        "MANAGE_USERS",
        "VIEW_AUDIT_LOGS",
        "SYSTEM_SETTINGS",
      ],
    },
    created_at: {
      type: String,
      default: () => new Date().toISOString(),
    },
    updated_at: {
      type: String,
      default: () => new Date().toISOString(),
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save bcrypt hashing for Admin passwords
AdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  if (this.password && this.password.startsWith("$2")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

AdminSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  if (this.password.startsWith("$2")) {
    return await bcrypt.compare(enteredPassword, this.password);
  }
  return enteredPassword === this.password;
};

module.exports = mongoose.model("Admin", AdminSchema);
