/**
 * NEXORA PULSECARE - ONE-CLICK MONGODB ATLAS SYNC SCRIPT
 * Run with: node sync_to_mongo.js
 * Uploads all users, appointments, and audit logs from backend/data/db.json into MongoDB Atlas.
 */

const fs = require("fs");
const path = require("path");
const { MongoClient } = require("mongodb");

const envPath = path.join(__dirname, "backend", ".env");
let uri = "mongodb+srv://vishwakarmalata85_db_user:HiFuViqHUkngCyj3@cluster0.0fzmn63.mongodb.net/prplus?retryWrites=true&w=majority&appName=Cluster0";

try {
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf8");
    const match = content.match(/MONGODB_URI=(.*)/);
    if (match && match[1]) uri = match[1].trim();
  }
} catch (e) {}

const dataFile = path.join(__dirname, "backend", "data", "db.json");

async function sync() {
  console.log("\n==================================================");
  console.log("🔄 SYNCING LOCAL DATABASE TO MONGODB ATLAS");
  console.log("==================================================");
  console.log("Target Database: prplus (Cluster: cluster0.0fzmn63.mongodb.net)");

  if (!fs.existsSync(dataFile)) {
    console.error("❌ backend/data/db.json not found!");
    process.exit(1);
  }

  const dbData = JSON.parse(fs.readFileSync(dataFile, "utf8"));
  console.log(`📦 Loaded from disk: ${dbData.users?.length || 0} users, ${dbData.appointments?.length || 0} appointments, ${dbData.logs?.length || 0} logs.`);

  console.log("\nConnecting to MongoDB Atlas Cluster...");
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });

  try {
    await client.connect();
    console.log("✅ Successfully connected to MongoDB Atlas!");

    const db = client.db("prplus");

    // 1. Sync Users
    if (dbData.users && dbData.users.length > 0) {
      const userCol = db.collection("users");
      for (const u of dbData.users) {
        await userCol.updateOne(
          { email: u.email },
          { $set: u },
          { upsert: true }
        );
      }
      console.log(`✅ Synced ${dbData.users.length} users into 'users' collection in MongoDB Atlas!`);
    }

    // 2. Sync Appointments
    if (dbData.appointments && dbData.appointments.length > 0) {
      const aptCol = db.collection("appointments");
      for (const a of dbData.appointments) {
        await aptCol.updateOne(
          { id: a.id },
          { $set: a },
          { upsert: true }
        );
      }
      console.log(`✅ Synced ${dbData.appointments.length} appointments into 'appointments' collection in MongoDB Atlas!`);
    }

    // 3. Sync Logs
    if (dbData.logs && dbData.logs.length > 0) {
      const logCol = db.collection("loginhistories");
      for (const l of dbData.logs) {
        await logCol.updateOne(
          { id: l.id },
          { $set: l },
          { upsert: true }
        );
      }
      console.log(`✅ Synced ${dbData.logs.length} audit logs into 'loginhistories' collection in MongoDB Atlas!`);
    }

    console.log("\n🎉 ALL LOCAL DATA SUCCESSFULLY STORED IN MONGODB ATLAS CLOUD!\n");
  } catch (err) {
    console.error("\n❌ MongoDB Atlas Connection Notice:", err.message);
    console.error("\n💡 IMPORTANT: To allow MongoDB Atlas to accept data:");
    console.error("   1. Go to: https://cloud.mongodb.com");
    console.error("   2. Click 'Network Access' (under Security in the left sidebar)");
    console.error("   3. Click 'Add IP Address' -> Select 'Allow Access from Anywhere' (0.0.0.0/0)");
    console.error("   4. Click 'Confirm' and re-run: node sync_to_mongo.js\n");
  } finally {
    await client.close();
  }
}

sync();
