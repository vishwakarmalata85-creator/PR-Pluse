/**
 * NEXORA PULSECARE - MODULAR EXPRESS + MONGOOSE PRODUCTION BACKEND
 * Connects to MongoDB Atlas, serves REST APIs & static frontend application.
 */

const express = require("express");
const path = require("path");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables from backend/.env and root .env
dotenv.config({ path: path.join(__dirname, ".env") });
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const { connectDB } = require("./config/db");
const User = require("./models/User");
const Admin = require("./models/Admin");
const Appointment = require("./models/Appointment");
const MedicineOrder = require("./models/MedicineOrder");
const LoginHistory = require("./models/LoginHistory");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const orderRoutes = require("./routes/orderRoutes");
const patientRoutes = require("./patient/patientRoutes");
const pharmacyRoutes = require("./pharmacy/pharmacyRoutes");
const aiRoutes = require("./routes/aiRoutes");
const adminRoutes = require("./admin/adminRoutes");
const userController = require("./controllers/userController");

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT_DIR = path.join(__dirname, "..");

// ============================================================================
// 1. MIDDLEWARE
// ============================================================================
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Request Logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    if (req.originalUrl.startsWith("/api/")) {
      const duration = Date.now() - start;
      console.log(`📡 [${req.method}] ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// ============================================================================
// 2. DATABASE SEEDER (SEEDS INITIAL USERS & DEMO DATA IF DB IS EMPTY)
// ============================================================================
const INITIAL_USERS = [
  {
    id: "usr-doc-001",
    email: "dr.vikram.sethi@gmail.com",
    password: "pass123",
    full_name: "Dr. Vikram Sethi, MD",
    phone: "+91 98765 00001",
    role: "DOCTOR",
    verificationStatus: "ACTIVE",
    doctor_profile: {
      mrn: "KMC-48921-2012",
      state_council: "Karnataka Medical Council (KMC)",
      specialization: "Internal Medicine",
      clinic_affiliation: "Pulse Care Clinic & Diagnostic Center",
      experience_years: 14,
      license_doc: "KMC_Certificate_48921.pdf",
    },
  },
  {
    id: "usr-doc-002",
    email: "dr.ananya.roy@gmail.com",
    password: "pass123",
    full_name: "Dr. Ananya Roy, MS",
    phone: "+91 98765 00002",
    role: "DOCTOR",
    verificationStatus: "PENDING_VERIFICATION",
    doctor_profile: {
      mrn: "MMC-99120-2024",
      state_council: "Maharashtra Medical Council (MMC)",
      specialization: "Cardiology",
      clinic_affiliation: "City Heart Care Center",
      experience_years: 4,
      license_doc: "MMC_Reg_Roy_99120.pdf",
    },
  },
  {
    id: "usr-pharma-001",
    email: "medplus.pharmacy@gmail.com",
    password: "pass123",
    full_name: "MedPlus 24/7 Super Pharmacy",
    phone: "+91 80 2553 1122",
    role: "PHARMACY",
    verificationStatus: "ACTIVE",
    pharmacy_profile: {
      store_name: "MedPlus 24/7 Super Pharmacy",
      dln: "KA-BLR-2024-88912",
      address: "80 Feet Road, 4th Block, Koramangala, Bengaluru",
      pincode: "560034",
      license_doc: "DrugLicense_KA_88912.pdf",
    },
  },
  {
    id: "usr-pat-001",
    email: "anil.verma@gmail.com",
    password: "pass123",
    full_name: "Anil Kumar Verma",
    phone: "+91 98765 43210",
    role: "PATIENT",
    verificationStatus: "ACTIVE",
    patient_profile: {
      dob: "1982-04-14",
      gender: "Male",
      blood_group: "B+",
      emergency_contact: "+91 98765 43211 (Wife)",
      abha_id: "91-4829-1029-4412",
    },
  },
  {
    id: "usr-admin-001",
    email: "admin.pulse@gmail.com",
    password: "admin123",
    full_name: "Nexora Platform Administrator",
    phone: "+91 80 9900 8800",
    role: "ADMIN",
    verificationStatus: "ACTIVE",
  },
];

const INITIAL_APPOINTMENTS = [
  {
    id: "apt-101",
    token: "TK-101",
    patientId: "usr-pat-001",
    patientName: "Anil Kumar Verma",
    doctorId: "usr-doc-001",
    doctorName: "Dr. Vikram Sethi, MD",
    department: "Internal Medicine",
    timeSlot: "10:30 AM",
    date: new Date().toISOString().split("T")[0],
    symptoms: ["Persistent dry cough x 4 days", "Mild fever in evenings", "Throat irritation"],
    vitals: { bp: "128/84 mmHg", pulse: "76 bpm", temp: "99.2 °F", spo2: "98%" },
    status: "REQUESTED",
  },
  {
    id: "apt-102",
    token: "TK-102",
    patientId: "usr-pat-002",
    patientName: "Meera Patel",
    doctorId: "usr-doc-001",
    doctorName: "Dr. Vikram Sethi, MD",
    department: "Internal Medicine",
    timeSlot: "11:00 AM",
    date: new Date().toISOString().split("T")[0],
    symptoms: ["Severe migraine headache", "Photophobia", "Nausea since morning"],
    vitals: { bp: "118/76 mmHg", pulse: "82 bpm", temp: "98.6 °F", spo2: "99%" },
    status: "CONFIRMED",
  },
  {
    id: "apt-103",
    token: "TK-103",
    patientId: "usr-pat-003",
    patientName: "Rohan Sharma",
    doctorId: "usr-doc-001",
    doctorName: "Dr. Vikram Sethi, MD",
    department: "Internal Medicine",
    timeSlot: "11:30 AM",
    date: new Date().toISOString().split("T")[0],
    symptoms: ["Postprandial bloating", "Epigastric discomfort", "Acid reflux x 1 week"],
    vitals: { bp: "135/88 mmHg", pulse: "78 bpm", temp: "98.4 °F", spo2: "97%" },
    status: "REQUESTED",
  },
];

const INITIAL_LOGS = [
  {
    id: "log-1",
    email: "dr.vikram.sethi@gmail.com",
    role: "DOCTOR",
    ipAddress: "192.168.1.45 (OPD Desk)",
    userAgent: "PulseCare Doctor Desktop (Chrome 130)",
    status: "AUTHORIZED",
    reason: "Doctor portal session login.",
  },
  {
    id: "log-2",
    email: "anil.verma@gmail.com",
    role: "PATIENT",
    ipAddress: "49.37.12.88 (Mobile 5G)",
    userAgent: "PulseCare Patient App (iOS 17)",
    status: "AUTHORIZED",
    reason: "Patient portal authentication.",
  },
  {
    id: "log-3",
    email: "medplus.pharmacy@gmail.com",
    role: "PHARMACY",
    ipAddress: "122.172.84.19 (Store Static IP)",
    userAgent: "PulseCare Pharmacy Terminal",
    status: "AUTHORIZED",
    reason: "Pharmacy POS login.",
  },
];

async function seedDatabaseIfEmpty() {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log("🌱 Seeding initial demo users into MongoDB Atlas...");
      for (const u of INITIAL_USERS) {
        await User.create(u);
      }
      console.log(`✅ Seeded ${INITIAL_USERS.length} demo users.`);
    }

    const aptCount = await Appointment.countDocuments();
    if (aptCount === 0) {
      console.log("🌱 Seeding initial appointment records...");
      for (const a of INITIAL_APPOINTMENTS) {
        await Appointment.create(a);
      }
      console.log(`✅ Seeded ${INITIAL_APPOINTMENTS.length} demo appointments.`);
    }

    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      console.log("🌱 Seeding initial administrator into MongoDB Atlas 'admins' collection...");
      const bcrypt = require("bcryptjs");
      const hash = bcrypt.hashSync("admin123", 10);
      await Admin.create({
        id: "usr-admin-001",
        name: "Nexora Platform Administrator",
        email: "admin.pulse@gmail.com",
        password: hash,
        role: "ADMIN",
        status: "ACTIVE",
        permissions: ["VERIFY_DOCTORS", "VERIFY_PHARMACIES", "MANAGE_USERS", "VIEW_AUDIT_LOGS", "SYSTEM_SETTINGS"],
      });
      console.log("✅ Seeded initial Admin document in MongoDB Atlas.");
    }

    const orderCount = await MedicineOrder.countDocuments();
    if (orderCount === 0) {
      console.log("🌱 Seeding initial medicine orders into MongoDB Atlas 'medicine_orders' collection...");
      await MedicineOrder.create({
        id: "ord-4021",
        orderNumber: "ORD-4021",
        patientId: "usr-pat-001",
        patientName: "Anil Kumar Verma",
        pharmacyId: "usr-pharma-001",
        pharmacyName: "MedPlus 24/7 Super Pharmacy",
        doctorId: "usr-doc-001",
        doctorName: "Dr. Vikram Sethi, MD",
        status: "DISPENSED",
        fulfillmentType: "COUNTER_PICKUP",
        pickupToken: "PK-2409",
        totalAmount: 106.00,
        subtotal: 106.00,
        medicines: [
          { name: "Jan Aushadhi Cefixime 200mg", drugName: "Cefixime 200mg Generic", quantity: 10, price: 60.00, isGeneric: true },
          { name: "Jan Aushadhi Pan 40", drugName: "Pantoprazole 40mg Generic", quantity: 10, price: 32.00, isGeneric: true },
          { name: "Paracetamol 650mg Generic", drugName: "Paracetamol 650mg Generic", quantity: 10, price: 14.00, isGeneric: true },
        ],
        items: [
          { name: "Jan Aushadhi Cefixime 200mg", drugName: "Cefixime 200mg Generic", quantity: 10, price: 60.00, isGeneric: true },
          { name: "Jan Aushadhi Pan 40", drugName: "Pantoprazole 40mg Generic", quantity: 10, price: 32.00, isGeneric: true },
          { name: "Paracetamol 650mg Generic", drugName: "Paracetamol 650mg Generic", quantity: 10, price: 14.00, isGeneric: true },
        ],
      });
      console.log("✅ Seeded initial MedicineOrder in MongoDB Atlas 'medicine_orders'.");
    }
  } catch (err) {
    console.warn("⚠️ Database seed warning:", err.message);
  }
}

// ============================================================================
// 3. API ROUTES
// ============================================================================
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/pharmacy", pharmacyRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/admin", adminRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "UP",
    framework: "Express + Mongoose",
    database: "MongoDB Atlas",
    timestamp: new Date().toISOString(),
  });
});

// ============================================================================
// 4. STATIC FRONTEND SERVING
// ============================================================================
app.use(express.static(ROOT_DIR, { maxAge: 0 }));

// SPA Fallback: for any non-API routes, serve index.html
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(ROOT_DIR, "index.html"));
});

// ============================================================================
// 5. GLOBAL ERROR HANDLER
// ============================================================================
app.use((err, req, res, next) => {
  console.error("❌ Unhandled Backend Error:", err.stack || err.message);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal Server Error",
  });
});

// ============================================================================
// 6. START SERVER
// ============================================================================
async function startServer() {
  await connectDB();
  await seedDatabaseIfEmpty();

  app.listen(PORT, () => {
    console.log(`\n==================================================`);
    console.log(`⚡ Nexora PulseCare Modular Express + Mongoose Backend`);
    console.log(`🌐 Application URL: http://localhost:${PORT}`);
    console.log(`📡 REST API Endpoints:`);
    console.log(`   - POST   /api/auth/login`);
    console.log(`   - POST   /api/auth/register`);
    console.log(`   - GET    /api/auth/login-history`);
    console.log(`   - GET    /api/users`);
    console.log(`   - POST   /api/users`);
    console.log(`   - PUT    /api/users/:id`);
    console.log(`   - DELETE /api/users/:id`);
    console.log(`   - GET    /api/appointments`);
    console.log(`   - POST   /api/appointments/book`);
    console.log(`   - PATCH  /api/appointments/status`);
    console.log(`   - DELETE /api/appointments/:id`);
    console.log(`   - GET    /api/admin/users`);
    console.log(`   - POST   /api/admin/verify-user`);
    console.log(`   - GET    /api/health`);
    console.log(`📂 Static Root:    ${ROOT_DIR}`);
    console.log(`==================================================\n`);
  });
}

startServer();
