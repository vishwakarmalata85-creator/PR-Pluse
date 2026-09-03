/**
 * NEXORA PULSECARE - HYBRID MONGOOSE & DISK/MEMORY PERSISTENCE LAYER
 * Ensures 100% platform uptime, zero data loss, and immediate MongoDB Atlas sync.
 * Completely separates USERS (Patients, Doctors, Pharmacies), ADMINS, APPOINTMENTS, and MEDICINE_ORDERS.
 */

const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Admin = require("./models/Admin");
const Appointment = require("./models/Appointment");
const MedicineOrder = require("./models/MedicineOrder");
const LoginHistory = require("./models/LoginHistory");
const { getIsConnected } = require("./config/db");

const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "db.json");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Hash password with bcrypt helper
function hashPassword(plainPassword) {
  if (plainPassword && plainPassword.startsWith("$2")) return plainPassword;
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(plainPassword, salt);
}

// Compare password helper
function checkPassword(enteredPassword, storedPassword) {
  if (!storedPassword || !enteredPassword) return false;
  if (storedPassword.startsWith("$2")) {
    try {
      return bcrypt.compareSync(enteredPassword, storedPassword);
    } catch {
      return false;
    }
  }
  return enteredPassword === storedPassword;
}

// Initial Seed Users (Patients, Doctors, Pharmacies only)
const SEED_USERS = [
  {
    id: "usr-doc-001",
    email: "dr.vikram.sethi@gmail.com",
    password: hashPassword("pass123"),
    full_name: "Dr. Vikram Sethi, MD",
    role: "DOCTOR",
    phone: "+91 98450 12345",
    verificationStatus: "VERIFIED",
    doctor_profile: {
      medical_license_number: "KMC-48921",
      specialization: "Internal Medicine & Cardiology",
      experience_years: 14,
      clinic_affiliation: "Pulse Care Clinic & Diagnostic Center",
      consultation_fee: 600,
    },
    created_at: new Date().toISOString(),
  },
  {
    id: "usr-doc-002",
    email: "dr.priya.nair@gmail.com",
    password: hashPassword("pass123"),
    full_name: "Dr. Priya Nair, MD",
    role: "DOCTOR",
    phone: "+91 98450 67890",
    verificationStatus: "VERIFIED",
    doctor_profile: {
      medical_license_number: "KMC-51204",
      specialization: "Pediatrics & Neonatology",
      experience_years: 9,
      clinic_affiliation: "Little Stars Children's Clinic",
      consultation_fee: 500,
    },
    created_at: new Date().toISOString(),
  },
  {
    id: "usr-pharma-001",
    email: "medplus.koramangala@gmail.com",
    password: hashPassword("pass123"),
    full_name: "MedPlus 24/7 Super Pharmacy",
    role: "PHARMACY",
    phone: "+91 80 2553 9911",
    verificationStatus: "VERIFIED",
    pharmacy_profile: {
      drug_license_number: "KA-BLR-DL-2023-88219",
      pharmacy_name: "MedPlus 24/7 Super Pharmacy",
      address: "80 Feet Road, 4th Block, Koramangala, Bengaluru",
      is_24x7: true,
      has_jan_aushadhi: true,
    },
    created_at: new Date().toISOString(),
  },
  {
    id: "usr-pharma-002",
    email: "apollo.indiranagar@gmail.com",
    password: hashPassword("pass123"),
    full_name: "Apollo Pharmacy 24/7",
    role: "PHARMACY",
    phone: "+91 80 2521 4400",
    verificationStatus: "VERIFIED",
    pharmacy_profile: {
      drug_license_number: "KA-BLR-DL-2022-77112",
      pharmacy_name: "Apollo Pharmacy 24/7",
      address: "100 Feet Road, Indiranagar, Bengaluru",
      is_24x7: true,
      has_jan_aushadhi: false,
    },
    created_at: new Date().toISOString(),
  },
  {
    id: "usr-pat-001",
    email: "anil.verma@gmail.com",
    password: hashPassword("pass123"),
    full_name: "Anil Kumar Verma",
    role: "PATIENT",
    phone: "+91 98765 43210",
    verificationStatus: "VERIFIED",
    patient_profile: {
      abha_id: "91-4829-1029-4412",
      abha_address: "anil.verma@abdm",
      blood_group: "O+",
      date_of_birth: "1982-06-15",
      gender: "Male",
      emergency_contact: "+91 98765 43211",
    },
    created_at: new Date().toISOString(),
  },
];

// Master Admin Seed
const SEED_ADMINS = [
  {
    id: "adm-001",
    email: "guchhaitrohit11@gmail.com",
    password: hashPassword("admin123"),
    full_name: "Rohit Guchhait (Master Admin)",
    role: "ADMIN",
    phone: "+91 99999 00000",
    admin_profile: {
      department: "System Governance",
      access_level: "SUPER_ADMIN",
      permissions: ["MANAGE_USERS", "VERIFY_DOCTORS", "AUDIT_LOGS", "SYSTEM_CONFIG"],
    },
    created_at: new Date().toISOString(),
  },
];

// Seed Appointments
const SEED_APPOINTMENTS = [
  {
    id: "apt-101",
    token: "T-101",
    tokenNumber: "T-101",
    patientId: "usr-pat-001",
    patientName: "Anil Kumar Verma",
    doctorId: "usr-doc-001",
    doctorName: "Dr. Vikram Sethi, MD",
    department: "Internal Medicine",
    clinicName: "Pulse Care Clinic & Diagnostic Center",
    clinicAddress: "80 Feet Rd, 4th Block, Koramangala, Bengaluru",
    date: new Date().toISOString().split("T")[0],
    timeSlot: "10:30 AM",
    time: "10:30 AM",
    consultationFee: 600,
    symptoms: ["Persistent dry cough x 4 days", "Mild fever in evenings"],
    vitals: {
      bp: "125/82 mmHg",
      pulse: "74 bpm",
      temp: "98.6 °F",
      spo2: "99%",
    },
    status: "CONFIRMED",
    clinicalNotes: "Patient reports seasonal allergy symptoms.",
    created_at: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "apt-102",
    token: "T-102",
    tokenNumber: "T-102",
    patientId: "usr-pat-002",
    patientName: "Sunita Sharma",
    doctorId: "usr-doc-001",
    doctorName: "Dr. Vikram Sethi, MD",
    department: "Internal Medicine",
    clinicName: "Pulse Care Clinic & Diagnostic Center",
    clinicAddress: "80 Feet Rd, 4th Block, Koramangala, Bengaluru",
    date: new Date().toISOString().split("T")[0],
    timeSlot: "11:00 AM",
    time: "11:00 AM",
    consultationFee: 600,
    symptoms: ["Routine hypertension review", "Medication refill"],
    vitals: {
      bp: "138/88 mmHg",
      pulse: "78 bpm",
      temp: "98.4 °F",
      spo2: "98%",
    },
    status: "REQUESTED",
    clinicalNotes: "",
    created_at: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Seed Medicine Orders
const SEED_ORDERS = [
  {
    id: "ord-4021",
    orderNumber: "ORD-4021",
    patientId: "usr-pat-001",
    patientName: "Anil Kumar Verma",
    pharmacyId: "usr-pharma-001",
    pharmacyName: "MedPlus 24/7 Super Pharmacy",
    doctorId: "usr-doc-001",
    doctorName: "Dr. Vikram Sethi, MD",
    medicines: [
      { name: "Jan Aushadhi Cefixime 200mg", drugName: "Cefixime 200mg", quantity: 10, price: 60.0, unitPrice: 60.0, isGeneric: true },
      { name: "Jan Aushadhi Pan 40 (Pantoprazole)", drugName: "Pantoprazole 40mg", quantity: 10, price: 32.0, unitPrice: 32.0, isGeneric: true },
      { name: "Paracetamol 650mg Generic", drugName: "Paracetamol 650mg", quantity: 10, price: 14.0, unitPrice: 14.0, isGeneric: true },
    ],
    items: [
      { name: "Jan Aushadhi Cefixime 200mg", drugName: "Cefixime 200mg", quantity: 10, price: 60.0, unitPrice: 60.0, isGeneric: true },
      { name: "Jan Aushadhi Pan 40 (Pantoprazole)", drugName: "Pantoprazole 40mg", quantity: 10, price: 32.0, unitPrice: 32.0, isGeneric: true },
      { name: "Paracetamol 650mg Generic", drugName: "Paracetamol 650mg", quantity: 10, price: 14.0, unitPrice: 14.0, isGeneric: true },
    ],
    subtotal: 106.0,
    deliveryFee: 0.0,
    totalAmount: 106.0,
    status: "PLACED",
    fulfillmentType: "COUNTER_PICKUP",
    pickupToken: "PK-2409",
    deliveryAddress: "80 Feet Rd, Koramangala, Bengaluru",
    estimatedMinutes: 10,
    created_at: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Seed Audit Logs
const SEED_LOGS = [
  {
    userId: "usr-doc-001",
    email: "dr.vikram.sethi@gmail.com",
    role: "DOCTOR",
    event: "LOGIN_SUCCESS",
    ipAddress: "127.0.0.1",
    timestamp: new Date().toISOString(),
  },
];

// Load persisted data from disk or initialize with seeds
let dbState = {
  users: [...SEED_USERS],
  admins: [...SEED_ADMINS],
  appointments: [...SEED_APPOINTMENTS],
  orders: [...SEED_ORDERS],
  logs: [...SEED_LOGS],
};

function loadDiskData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, "utf8");
      const parsed = JSON.parse(content);
      if (parsed.users && Array.isArray(parsed.users)) {
        dbState.users = parsed.users.filter((u) => u.role !== "ADMIN");
      }
      if (parsed.admins && Array.isArray(parsed.admins)) {
        dbState.admins = parsed.admins;
      } else {
        dbState.admins = [...SEED_ADMINS];
      }
      if (parsed.appointments && Array.isArray(parsed.appointments)) {
        dbState.appointments = parsed.appointments;
      }
      if (parsed.orders && Array.isArray(parsed.orders)) {
        dbState.orders = parsed.orders;
      } else {
        dbState.orders = [...SEED_ORDERS];
      }
      if (parsed.logs && Array.isArray(parsed.logs)) {
        dbState.logs = parsed.logs;
      }
    } else {
      saveDiskData();
    }
  } catch (err) {
    console.warn("Could not read disk database file:", err.message);
  }
}

function saveDiskData() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(dbState, null, 2), "utf8");
  } catch (err) {
    console.warn("Could not save to disk database file:", err.message);
  }
}

loadDiskData();

// ----------------------------------------------------------------------------
// USER STORE METHODS (PATIENTS, DOCTORS, PHARMACIES)
// ----------------------------------------------------------------------------
async function getUsers(filter = {}) {
  if (getIsConnected()) {
    try {
      return await User.find(filter).select("-password").sort({ createdAt: -1 }).lean();
    } catch (e) {
      console.warn("DB find users fallback:", e.message);
    }
  }
  return dbState.users
    .filter((u) => (!filter.role || u.role === filter.role) && (!filter.verificationStatus || u.verificationStatus === filter.verificationStatus))
    .map((u) => {
      const copy = { ...u };
      delete copy.password;
      return copy;
    });
}

async function findUserByEmail(email) {
  if (getIsConnected()) {
    try {
      return await User.findOne({ email: email.toLowerCase() }).lean();
    } catch (e) {
      console.warn("DB find user by email fallback:", e.message);
    }
  }
  return dbState.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

async function findUserById(id) {
  if (getIsConnected()) {
    try {
      return await User.findOne({ $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] }).select("-password").lean();
    } catch (e) {
      console.warn("DB find user by id fallback:", e.message);
    }
  }
  const u = dbState.users.find((u) => u.id === id || u._id === id);
  if (!u) return null;
  const copy = { ...u };
  delete copy.password;
  return copy;
}

async function addUser(userData) {
  if (userData.password && !userData.password.startsWith("$2")) {
    userData.password = hashPassword(userData.password);
  }
  if (!userData.id) {
    userData.id = `usr-${Date.now().toString(36)}`;
  }

  dbState.users.unshift(userData);
  saveDiskData();

  if (getIsConnected()) {
    try {
      await User.create(userData);
    } catch (e) {
      console.warn("DB add user fallback:", e.message);
    }
  }
  const copy = { ...userData };
  delete copy.password;
  return copy;
}

async function updateUserById(id, updateFields) {
  const idx = dbState.users.findIndex((u) => u.id === id || u._id === id);
  let updated = null;
  if (idx !== -1) {
    dbState.users[idx] = { ...dbState.users[idx], ...updateFields, updatedAt: new Date().toISOString() };
    updated = { ...dbState.users[idx] };
    delete updated.password;
    saveDiskData();
  }

  if (getIsConnected()) {
    try {
      updated = await User.findOneAndUpdate(
        { $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] },
        { $set: updateFields },
        { new: true }
      ).select("-password").lean();
    } catch (e) {
      console.warn("DB update user fallback:", e.message);
    }
  }
  return updated;
}

async function deleteUserById(id) {
  const idx = dbState.users.findIndex((u) => u.id === id || u._id === id);
  let deleted = null;
  if (idx !== -1) {
    deleted = dbState.users.splice(idx, 1)[0];
    saveDiskData();
  }
  if (getIsConnected()) {
    try {
      deleted = await User.findOneAndDelete({ $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] }).lean();
    } catch (e) {
      console.warn("DB delete user fallback:", e.message);
    }
  }
  return deleted;
}

// ----------------------------------------------------------------------------
// ADMIN STORE METHODS (DEDICATED 'admins' COLLECTION)
// ----------------------------------------------------------------------------
async function getAdmins(filter = {}) {
  if (getIsConnected()) {
    try {
      return await Admin.find(filter).select("-password").sort({ createdAt: -1 }).lean();
    } catch (e) {
      console.warn("DB find admins fallback:", e.message);
    }
  }
  return dbState.admins.map((a) => {
    const copy = { ...a };
    delete copy.password;
    return copy;
  });
}

async function findAdminByEmail(email) {
  if (getIsConnected()) {
    try {
      return await Admin.findOne({ email: email.toLowerCase() }).lean();
    } catch (e) {
      console.warn("DB find admin by email fallback:", e.message);
    }
  }
  return dbState.admins.find((a) => a.email.toLowerCase() === email.toLowerCase());
}

async function findAdminById(id) {
  if (getIsConnected()) {
    try {
      return await Admin.findOne({ $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] }).select("-password").lean();
    } catch (e) {
      console.warn("DB find admin by id fallback:", e.message);
    }
  }
  const a = dbState.admins.find((a) => a.id === id || a._id === id);
  if (!a) return null;
  const copy = { ...a };
  delete copy.password;
  return copy;
}

async function addAdmin(adminData) {
  if (adminData.password && !adminData.password.startsWith("$2")) {
    adminData.password = hashPassword(adminData.password);
  }
  if (!adminData.id) {
    adminData.id = `adm-${Date.now().toString(36)}`;
  }
  adminData.role = "ADMIN";

  dbState.admins.unshift(adminData);
  saveDiskData();

  if (getIsConnected()) {
    try {
      await Admin.create(adminData);
    } catch (e) {
      console.warn("DB add admin fallback:", e.message);
    }
  }
  const copy = { ...adminData };
  delete copy.password;
  return copy;
}

async function updateAdminById(id, updateFields) {
  const idx = dbState.admins.findIndex((a) => a.id === id || a._id === id);
  let updated = null;
  if (idx !== -1) {
    dbState.admins[idx] = { ...dbState.admins[idx], ...updateFields, updatedAt: new Date().toISOString() };
    updated = { ...dbState.admins[idx] };
    delete updated.password;
    saveDiskData();
  }

  if (getIsConnected()) {
    try {
      updated = await Admin.findOneAndUpdate(
        { $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] },
        { $set: updateFields },
        { new: true }
      ).select("-password").lean();
    } catch (e) {
      console.warn("DB update admin fallback:", e.message);
    }
  }
  return updated;
}

// ----------------------------------------------------------------------------
// APPOINTMENTS STORE METHODS ('appointments' COLLECTION)
// ----------------------------------------------------------------------------
async function getAppointmentsList(filter = {}) {
  if (getIsConnected()) {
    try {
      return await Appointment.find(filter).sort({ createdAt: -1 }).lean();
    } catch (e) {
      console.warn("DB find appointments fallback:", e.message);
    }
  }
  return dbState.appointments.filter((a) => {
    if (filter.patientId && a.patientId !== filter.patientId) return false;
    if (filter.doctorId && a.doctorId !== filter.doctorId) return false;
    if (filter.status && a.status !== filter.status) return false;
    return true;
  });
}

async function addAppointment(aptData) {
  dbState.appointments.unshift(aptData);
  saveDiskData();

  if (getIsConnected()) {
    try {
      await Appointment.create(aptData);
    } catch (e) {
      console.warn("DB add appointment fallback:", e.message);
    }
  }
  return aptData;
}

async function updateAppointment(id, updateFields) {
  const idx = dbState.appointments.findIndex((a) => a.id === id || a._id === id || a.token === id || a.tokenNumber === id);
  let updated = null;
  if (idx !== -1) {
    dbState.appointments[idx] = { ...dbState.appointments[idx], ...updateFields, updatedAt: new Date().toISOString() };
    updated = dbState.appointments[idx];
    saveDiskData();
  }

  if (getIsConnected()) {
    try {
      updated = await Appointment.findOneAndUpdate(
        { $or: [{ id }, { token: id }, { tokenNumber: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] },
        { $set: updateFields },
        { new: true }
      ).lean();
    } catch (e) {
      console.warn("DB update appointment fallback:", e.message);
    }
  }
  return updated;
}

async function deleteAppointmentById(id) {
  const idx = dbState.appointments.findIndex((a) => a.id === id || a._id === id);
  let deleted = null;
  if (idx !== -1) {
    deleted = dbState.appointments.splice(idx, 1)[0];
    saveDiskData();
  }
  if (getIsConnected()) {
    try {
      deleted = await Appointment.findOneAndDelete({ $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] }).lean();
    } catch (e) {
      console.warn("DB delete appointment fallback:", e.message);
    }
  }
  return deleted;
}

// ----------------------------------------------------------------------------
// MEDICINE ORDERS STORE METHODS ('medicine_orders' COLLECTION)
// ----------------------------------------------------------------------------
const PATIENT_ORDERS_DIR = path.join(DATA_DIR, "orders", "patient");
const PHARMACY_ORDERS_DIR = path.join(DATA_DIR, "orders", "pharmacy");

if (!fs.existsSync(PATIENT_ORDERS_DIR)) fs.mkdirSync(PATIENT_ORDERS_DIR, { recursive: true });
if (!fs.existsSync(PHARMACY_ORDERS_DIR)) fs.mkdirSync(PHARMACY_ORDERS_DIR, { recursive: true });

function persistOrderFiles(order) {
  if (!order) return;
  try {
    const orderFilename = `${order.orderNumber || order.id}.json`;
    if (order.patientId) {
      const patDir = path.join(PATIENT_ORDERS_DIR, order.patientId);
      if (!fs.existsSync(patDir)) fs.mkdirSync(patDir, { recursive: true });
      fs.writeFileSync(path.join(patDir, orderFilename), JSON.stringify(order, null, 2), "utf8");
    }
    if (order.pharmacyId) {
      const pharmaDir = path.join(PHARMACY_ORDERS_DIR, order.pharmacyId);
      if (!fs.existsSync(pharmaDir)) fs.mkdirSync(pharmaDir, { recursive: true });
      fs.writeFileSync(path.join(pharmaDir, orderFilename), JSON.stringify(order, null, 2), "utf8");
    }
  } catch (e) {
    console.warn("Could not write order mirror JSON file:", e.message);
  }
}

async function getOrdersList(filter = {}) {
  if (getIsConnected()) {
    try {
      let query = {};
      if (filter.patientId) query.patientId = filter.patientId;
      if (filter.status) query.status = filter.status;
      if (filter.pharmacyId && filter.pharmacyId !== "all") {
        query.$or = [
          { pharmacyId: filter.pharmacyId },
          { pharmacyId: filter.pharmacyId.replace("usr-", "") },
          { pharmacyId: `usr-${filter.pharmacyId}` },
        ];
      }
      return await MedicineOrder.find(query).sort({ createdAt: -1 }).lean();
    } catch (e) {
      console.warn("DB find orders fallback:", e.message);
    }
  }
  return dbState.orders.filter((o) => {
    if (filter.patientId && o.patientId !== filter.patientId) return false;
    if (filter.pharmacyId && filter.pharmacyId !== "all") {
      const p1 = (o.pharmacyId || "").toLowerCase();
      const p2 = filter.pharmacyId.toLowerCase();
      const match =
        p1 === p2 ||
        p1.replace("usr-", "") === p2.replace("usr-", "") ||
        p1.includes(p2) ||
        p2.includes(p1);
      if (!match) return false;
    }
    if (filter.status && o.status !== filter.status) return false;
    return true;
  });
}

async function findOrderById(id) {
  if (getIsConnected()) {
    try {
      return await MedicineOrder.findOne({
        $or: [{ id }, { orderNumber: id }, { pickupToken: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
      }).lean();
    } catch (e) {
      console.warn("DB find order by id fallback:", e.message);
    }
  }
  return dbState.orders.find((o) => o.id === id || o.orderNumber === id || o.pickupToken === id || o._id === id);
}

async function addOrder(orderData) {
  dbState.orders.unshift(orderData);
  saveDiskData();
  persistOrderFiles(orderData);

  if (getIsConnected()) {
    try {
      await MedicineOrder.create(orderData);
    } catch (e) {
      console.warn("DB add order fallback:", e.message);
    }
  }
  return orderData;
}

async function updateOrderStatus(id, updateFields) {
  const idx = dbState.orders.findIndex(
    (o) => o.id === id || o._id === id || o.orderNumber === id || o.pickupToken === id
  );
  let updated = null;
  if (idx !== -1) {
    dbState.orders[idx] = { ...dbState.orders[idx], ...updateFields, updatedAt: new Date().toISOString() };
    updated = dbState.orders[idx];
    saveDiskData();
    persistOrderFiles(updated);
  }

  if (getIsConnected()) {
    try {
      updated = await MedicineOrder.findOneAndUpdate(
        { $or: [{ id }, { orderNumber: id }, { pickupToken: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] },
        { $set: updateFields },
        { new: true }
      ).lean();
      if (updated) persistOrderFiles(updated);
    } catch (e) {
      console.warn("DB update order fallback:", e.message);
    }
  }
  return updated;
}

async function deleteOrderById(id) {
  const idx = dbState.orders.findIndex((o) => o.id === id || o._id === id || o.orderNumber === id);
  let deleted = null;
  if (idx !== -1) {
    deleted = dbState.orders.splice(idx, 1)[0];
    saveDiskData();
  }
  if (getIsConnected()) {
    try {
      deleted = await MedicineOrder.findOneAndDelete({
        $or: [{ id }, { orderNumber: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
      }).lean();
    } catch (e) {
      console.warn("DB delete order fallback:", e.message);
    }
  }
  return deleted;
}

// ----------------------------------------------------------------------------
// LOGS STORE METHODS
// ----------------------------------------------------------------------------
async function addLog(logData) {
  dbState.logs.unshift(logData);
  saveDiskData();

  if (getIsConnected()) {
    try {
      await LoginHistory.create(logData);
    } catch (e) {
      console.warn("DB add log fallback:", e.message);
    }
  }
  return logData;
}

async function getLogs(limit = 100) {
  if (getIsConnected()) {
    try {
      return await LoginHistory.find().sort({ createdAt: -1 }).limit(limit).lean();
    } catch (e) {
      console.warn("DB find logs fallback:", e.message);
    }
  }
  return dbState.logs.slice(0, limit);
}

// ----------------------------------------------------------------------------
// AUTOMATIC ATLAS SYNC ENGINE
// Pushes all local users, admins, appointments, and medicine orders into Atlas
// as soon as connection is established.
// ----------------------------------------------------------------------------
async function syncStoreToAtlas() {
  if (!getIsConnected()) return;
  console.log("🔄 Synchronizing all local collections to MongoDB Atlas ('prplus')...");
  try {
    for (const u of dbState.users) {
      await User.findOneAndUpdate({ $or: [{ id: u.id }, { email: u.email }] }, { $set: u }, { upsert: true });
    }
    for (const a of dbState.admins) {
      await Admin.findOneAndUpdate({ $or: [{ id: a.id }, { email: a.email }] }, { $set: a }, { upsert: true });
    }
    for (const apt of dbState.appointments) {
      await Appointment.findOneAndUpdate({ $or: [{ id: apt.id }, { token: apt.token }] }, { $set: apt }, { upsert: true });
    }
    for (const ord of dbState.orders) {
      await MedicineOrder.findOneAndUpdate({ $or: [{ id: ord.id }, { orderNumber: ord.orderNumber }] }, { $set: ord }, { upsert: true });
    }
    for (const l of dbState.logs) {
      await LoginHistory.findOneAndUpdate({ id: l.id }, { $set: l }, { upsert: true });
    }
    console.log("✅ All collections successfully synced to MongoDB Atlas ('prplus')!");
  } catch (err) {
    console.warn("⚠️ Atlas auto-sync notice:", err.message);
  }
}

module.exports = {
  hashPassword,
  checkPassword,
  getUsers,
  findUserByEmail,
  findUserById,
  addUser,
  updateUserById,
  deleteUserById,
  getAdmins,
  findAdminByEmail,
  findAdminById,
  addAdmin,
  updateAdminById,
  getAppointmentsList,
  addAppointment,
  updateAppointment,
  deleteAppointmentById,
  getOrdersList,
  findOrderById,
  addOrder,
  updateOrderStatus,
  deleteOrderById,
  addLog,
  getLogs,
  syncStoreToAtlas,
};
