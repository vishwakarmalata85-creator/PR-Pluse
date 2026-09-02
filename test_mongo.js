/**
 * Quick MongoDB Connection Test Script
 * Run with: node test_mongo.js
 */

const { MongoClient } = require("mongodb");
const fs = require("fs");
const path = require("path");

// Read .env if present
let mongoUri = process.env.MONGODB_URI;
try {
  const envContent = fs.readFileSync(path.join(__dirname, ".env"), "utf8");
  const match = envContent.match(/MONGODB_URI=(.*)/);
  if (match && match[1]) {
    mongoUri = match[1].trim();
  }
} catch (e) {
  // Ignore
}

if (!mongoUri || mongoUri.includes("<CLUSTER_HOST>")) {
  console.error("\n❌ Error: Please update .env with your actual MongoDB cluster host address.");
  console.error("   Example: mongodb+srv://vishwakarmalata85_db_user:HiFuViqHUkngCyj3@cluster0.abcde.mongodb.net/prplus?retryWrites=true&w=majority\n");
  process.exit(1);
}

async function testConnection() {
  console.log("\n🔄 Attempting to connect to MongoDB Atlas...");
  const client = new MongoClient(mongoUri);

  try {
    await client.connect();
    console.log("✅ Successfully connected to MongoDB Atlas!");
    
    const adminDb = client.db().admin();
    const dbs = await adminDb.listDatabases();
    console.log("\n📦 Available Databases:");
    dbs.databases.forEach((db) => console.log(`   - ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`));
    console.log("\n🚀 Integration Ready!\n");
  } catch (err) {
    console.error("\n❌ Connection Failed:", err.message);
    console.error("💡 Check if:");
    console.error("   1. Cluster hostname in .env is correct");
    console.error("   2. Network Access in MongoDB Atlas allows your IP (or 0.0.0.0/0)\n");
  } finally {
    await client.close();
  }
}

testConnection();
