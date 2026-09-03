const { MongoClient } = require("mongodb");
const mongoose = require("mongoose");

const uris = [
  "mongodb+srv://vishwakarmalata85_db_user:HiFuViqHUkngCyj3@cluster0.0fzmn63.mongodb.net/prplus?retryWrites=true&w=majority&appName=Cluster0",
  "mongodb+srv://rohitguchhait:rohit2004@cluster0.0fzmn63.mongodb.net/prplus?retryWrites=true&w=majority&appName=Cluster0",
  "mongodb+srv://vishwakarmalata85_db_user:HiFuViqHUkngCyj3@cluster0.0fzmn63.mongodb.net/prplus?ssl=true&authSource=admin&retryWrites=true&w=majority",
];

async function testUri(uri, idx) {
  console.log(`\n--- Testing URI #${idx + 1} ---`);
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 6000,
    });
    console.log(`✅ Mongoose connected successfully to ${conn.connection.host}!`);
    const collections = await conn.connection.db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));
    await mongoose.disconnect();
    return true;
  } catch (err) {
    console.error(`❌ Error on URI #${idx + 1}:`, err.message);
    return false;
  }
}

async function run() {
  for (let i = 0; i < uris.length; i++) {
    await testUri(uris[i], i);
  }
}

run();
