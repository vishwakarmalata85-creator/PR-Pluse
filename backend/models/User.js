const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, "Email address is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    full_name: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ["PATIENT", "DOCTOR", "PHARMACY"],
      default: "PATIENT",
      index: true,
    },
    verificationStatus: {
      type: String,
      enum: ["ACTIVE", "PENDING_VERIFICATION", "REJECTED"],
      default: "ACTIVE",
    },
    rejectionReason: {
      type: String,
      default: "",
    },
    doctor_profile: {
      mrn: { type: String, default: "" },
      state_council: { type: String, default: "" },
      specialization: { type: String, default: "" },
      clinic_affiliation: { type: String, default: "" },
      experience_years: { type: Number, default: 0 },
      license_doc: { type: String, default: "" },
    },
    pharmacy_profile: {
      store_name: { type: String, default: "" },
      dln: { type: String, default: "" },
      address: { type: String, default: "" },
      pincode: { type: String, default: "" },
      license_doc: { type: String, default: "" },
    },
    patient_profile: {
      dob: { type: String, default: "" },
      gender: { type: String, default: "" },
      blood_group: { type: String, default: "" },
      emergency_contact: { type: String, default: "" },
      abha_id: { type: String, default: "" },
    },
    isActive: {
      type: Boolean,
      default: true,
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
    collection: "users",
  }
);

// Hash password with bcrypt before saving document
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  // If already hashed (starts with $2), skip re-hashing
  if (this.password && this.password.startsWith("$2")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  if (this.password.startsWith("$2")) {
    return await bcrypt.compare(enteredPassword, this.password);
  }
  return enteredPassword === this.password;
};

module.exports = mongoose.model("User", UserSchema);
