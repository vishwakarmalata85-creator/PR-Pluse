/**
 * NEXORA PULSECARE - SECURE ADMIN PROVISIONING SCRIPT
 * Usage: npm run create-admin [email] [name] [password]
 * Example: npm run create-admin
 *          npm run create-admin admin.pulse@gmail.com "PulseCare Admin" mySecretPass123
 */

require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
require("dotenv").config({ path: require("path").join(__dirname, "..", "backend", ".env") });

const readline = require("readline");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const path = require("path");

const Admin = require("../backend/models/Admin");
const store = require("../backend/store");

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://rohitguchhait:rohit2004@cluster0.0fzmn63.mongodb.net/prplus?retryWrites=true&w=majority&appName=Cluster0";

function askQuestion(query, isPassword = false) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    if (isPassword && process.stdin.isTTY) {
      process.stdout.write(query);
      let pass = "";
      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.setEncoding("utf8");

      const onData = (char) => {
        if (char === "\n" || char === "\r" || char === "\u0004") {
          process.stdin.setRawMode(false);
          process.stdin.pause();
          process.stdin.removeListener("data", onData);
          process.stdout.write("\n");
          rl.close();
          resolve(pass);
        } else if (char === "\u0003") {
          process.exit();
        } else if (char === "\b" || char === "\x7f") {
          if (pass.length > 0) {
            pass = pass.slice(0, -1);
            process.stdout.write("\b \b");
          }
        } else {
          pass += char;
          process.stdout.write("*");
        }
      };

      process.stdin.on("data", onData);
    } else {
      rl.question(query, (answer) => {
        rl.close();
        resolve(answer.trim());
      });
    }
  });
}

async function runProvisioning() {
  console.log("\n==================================================");
  console.log("🛡️  NEXORA PULSECARE - ADMINISTRATOR PROVISIONING");
  console.log("==================================================");

  // 1. Connect to MongoDB Atlas
  let dbConnected = false;
  try {
    console.log("🔌 Connecting to MongoDB Atlas database (prplus)...");
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("✅ Connected to MongoDB Atlas (admins collection).");
    dbConnected = true;
  } catch (err) {
    console.warn("⚠️ Atlas direct connection notice:", err.message);
    console.log("📁 Operating with persistent store layer.");
  }

  // 2. Read CLI Arguments or Prompt User
  const args = process.argv.slice(2);
  let email = args[0];
  let name = args[1];
  let password = args[2];

  if (!email) {
    if (process.stdin.isTTY) {
      email = await askQuestion("Enter Admin Email [admin.pulse@gmail.com]: ");
    }
    if (!email) email = "admin.pulse@gmail.com";
  }

  if (!name) {
    if (process.stdin.isTTY) {
      name = await askQuestion("Enter Admin Name [PulseCare Platform Administrator]: ");
    }
    if (!name) name = "PulseCare Platform Administrator";
  }

  if (!password) {
    if (process.stdin.isTTY) {
      password = await askQuestion("Enter Admin Password [admin123]: ", true);
    }
    if (!password) password = "admin123";
  }

  email = email.toLowerCase().trim();

  // 3. Hash Password with bcrypt
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const adminData = {
    id: `adm-${Date.now().toString(36)}`,
    name,
    email,
    password: passwordHash,
    role: "ADMIN",
    status: "ACTIVE",
    permissions: [
      "VERIFY_DOCTORS",
      "VERIFY_PHARMACIES",
      "MANAGE_USERS",
      "VIEW_AUDIT_LOGS",
      "SYSTEM_SETTINGS",
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // 4. Save into MongoDB collection 'admins'
  let savedAdmin = null;
  if (dbConnected) {
    try {
      const existing = await Admin.findOne({ email });
      if (existing) {
        console.log(`ℹ️ Admin '${email}' already exists in MongoDB Atlas.`);
        existing.password = passwordHash;
        existing.status = "ACTIVE";
        existing.name = name;
        await existing.save();
        savedAdmin = existing;
        console.log("✅ Admin credentials & ACTIVE status updated in Atlas.");
      } else {
        savedAdmin = await Admin.create(adminData);
        console.log("✅ Created new Admin document in MongoDB Atlas 'admins' collection.");
      }
    } catch (e) {
      console.warn("Atlas save error:", e.message);
    }
  }

  // 5. Also persist in store.js
  await store.addAdmin(adminData);

  console.log("\n--------------------------------------------------");
  console.log("🎉 ADMINISTRATOR PROVISIONED SUCCESSFULLY!");
  console.log(`👤 Name:   ${name}`);
  console.log(`📧 Email:  ${email}`);
  console.log(`🛡️  Role:   ADMIN`);
  console.log(`🟢 Status: ACTIVE`);
  console.log("🔒 Password: [SECURELY HASHED WITH BCRYPT]");
  console.log("==================================================\n");

  if (dbConnected) {
    await mongoose.disconnect();
  }
  process.exit(0);
}

runProvisioning().catch((err) => {
  console.error("Provisioning failed:", err);
  process.exit(1);
});
