/**
 * NEXORA PULSECARE - DIRECT MONGODB ATLAS SYNCHRONIZATION SCRIPT
 * Creates 'medicine_orders' and 'admins' collections directly in MongoDB Atlas 'prplus'.
 * Usage: node scripts/syncToAtlas.js
 */

require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
require("dotenv").config({ path: require("path").join(__dirname, "..", "backend", ".env") });

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://vishwakarmalata85_db_user:HiFuViqHUkngCyj3@cluster0.0fzmn63.mongodb.net/prplus?retryWrites=true&w=majority&appName=Cluster0";

const MedicineOrder = require("../backend/models/MedicineOrder");
const Admin = require("../backend/models/Admin");
const User = require("../backend/models/User");
const Appointment = require("../backend/models/Appointment");

async function syncAtlas() {
  console.log("\n========================================================");
  console.log("🍃 DIRECT MONGODB ATLAS ('prplus') COLLECTION SYNC");
  console.log("========================================================");
  console.log("Connecting to:", MONGODB_URI.replace(/:([^:@]+)@/, ":****@"));

  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: "prplus",
      serverSelectionTimeoutMS: 8000,
    });
    console.log("✅ Successfully connected to MongoDB Atlas database 'prplus'!\n");

    // 1. Sync medicine_orders collection
    const orderCount = await MedicineOrder.countDocuments();
    console.log(`📦 Current 'medicine_orders' count: ${orderCount}`);
    if (orderCount === 0) {
      console.log("🚀 Inserting initial documents into 'medicine_orders'...");
      await MedicineOrder.create([
        {
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
        },
        {
          id: "ord-9972",
          orderNumber: "ORD-9972",
          patientId: "usr-pat-001",
          patientName: "Anil Kumar Verma",
          pharmacyId: "usr-pharma-001",
          pharmacyName: "MedPlus 24/7 Super Pharmacy",
          doctorId: "usr-doc-001",
          doctorName: "Dr. Vikram Sethi, MD",
          status: "PLACED",
          fulfillmentType: "COUNTER_PICKUP",
          pickupToken: "PK-4153",
          totalAmount: 106.00,
          subtotal: 106.00,
          medicines: [
            { name: "Jan Aushadhi Cefixime 200mg", drugName: "Cefixime 200mg Generic", quantity: 10, price: 60.00, isGeneric: true },
            { name: "Jan Aushadhi Pan 40", drugName: "Pantoprazole 40mg Generic", quantity: 7, price: 32.00, isGeneric: true },
            { name: "Paracetamol 650mg Generic", drugName: "Paracetamol 650mg Generic", quantity: 6, price: 14.00, isGeneric: true },
          ],
          items: [
            { name: "Jan Aushadhi Cefixime 200mg", drugName: "Cefixime 200mg Generic", quantity: 10, price: 60.00, isGeneric: true },
            { name: "Jan Aushadhi Pan 40", drugName: "Pantoprazole 40mg Generic", quantity: 7, price: 32.00, isGeneric: true },
            { name: "Paracetamol 650mg Generic", drugName: "Paracetamol 650mg Generic", quantity: 6, price: 14.00, isGeneric: true },
          ],
        }
      ]);
      console.log("✅ 'medicine_orders' collection created and seeded in Atlas!");
    } else {
      console.log("ℹ️ 'medicine_orders' collection already has documents in Atlas.");
    }

    // 2. Sync admins collection
    const adminCount = await Admin.countDocuments();
    console.log(`🛡️ Current 'admins' count: ${adminCount}`);
    if (adminCount === 0) {
      console.log("🚀 Inserting initial administrator into 'admins'...");
      const passwordHash = await bcrypt.hash("admin123", 10);
      await Admin.create({
        id: "usr-admin-001",
        name: "Nexora Platform Administrator",
        email: "admin.pulse@gmail.com",
        password: passwordHash,
        role: "ADMIN",
        status: "ACTIVE",
        permissions: ["VERIFY_DOCTORS", "VERIFY_PHARMACIES", "MANAGE_USERS", "VIEW_AUDIT_LOGS", "SYSTEM_SETTINGS"],
      });
      console.log("✅ 'admins' collection created and seeded in Atlas!");
    }

    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("\n📁 Collections now active in MongoDB Atlas 'prplus':");
    collections.forEach((c) => console.log(`   📂 ${c.name}`));

    console.log("\n========================================================");
    console.log("🎉 ATLAS SYNC COMPLETE! Refresh your Atlas Data Explorer.");
    console.log("========================================================\n");

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("\n❌ Atlas Connection Error:", err.message);
    console.log("\n💡 SOLUTION: In MongoDB Atlas (cloud.mongodb.com):");
    console.log("   1. Go to 'Network Access' (left sidebar)");
    console.log("   2. Click '+ Add IP Address'");
    console.log("   3. Click 'Allow Access from Anywhere' (0.0.0.0/0)");
    console.log("   4. Click 'Confirm'");
    console.log("   5. Re-run: node scripts/syncToAtlas.js\n");
    process.exit(1);
  }
}

syncAtlas();
