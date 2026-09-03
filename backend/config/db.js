const mongoose = require("mongoose");
const dns = require("dns");

// Windows IPv4 DNS priority fix for MongoDB Atlas SRV lookups
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}

let isConnected = false;
let retryTimer = null;

const getUri = () =>
  process.env.MONGODB_URI ||
  "mongodb+srv://vishwakarmalata85_db_user:HiFuViqHUkngCyj3@cluster0.0fzmn63.mongodb.net/prplus?retryWrites=true&w=majority&appName=Cluster0";

const connectDB = async () => {
  const uri = getUri();
  mongoose.set("bufferCommands", false);

  try {
    const conn = await mongoose.connect(uri, {
      dbName: "prplus",
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      family: 4,
    });

    isConnected = true;
    console.log(`✅ MongoDB Atlas Connected via Mongoose: ${conn.connection.host} (DB: ${conn.connection.name})`);
    
    // Trigger initial sync to Atlas
    try {
      const store = require("../store");
      if (store.syncStoreToAtlas) {
        store.syncStoreToAtlas();
      }
    } catch (e) {
      // Ignore circular ref on initial boot
    }

    return conn;
  } catch (error) {
    isConnected = false;
    console.warn(`⚠️ MongoDB Atlas Connection Notice (${error.message}). Resilient cache active.`);
    
    // Background auto-retry every 8 seconds until Atlas accepts connection
    if (!retryTimer) {
      retryTimer = setInterval(async () => {
        if (!isConnected) {
          try {
            await mongoose.connect(getUri(), {
              dbName: "prplus",
              serverSelectionTimeoutMS: 4000,
              connectTimeoutMS: 4000,
              family: 4,
            });
            isConnected = true;
            console.log("🎉 MongoDB Atlas successfully connected in background! Syncing all collections...");
            clearInterval(retryTimer);
            retryTimer = null;
            const store = require("../store");
            if (store.syncStoreToAtlas) {
              store.syncStoreToAtlas();
            }
          } catch (e) {
            // Keep retrying quietly
          }
        }
      }, 8000);
    }
  }
};

mongoose.connection.on("connected", () => {
  isConnected = true;
  console.log("✅ MongoDB Atlas Mongoose connection active.");
});

mongoose.connection.on("disconnected", () => {
  isConnected = false;
  console.warn("⚠️ MongoDB Atlas disconnected. Using in-memory store.");
});

function getIsConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}

module.exports = { connectDB, getIsConnected };
