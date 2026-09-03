const dns = require("dns");
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}

const mongoose = require("mongoose");

const uris = [
  "mongodb+srv://vishwakarmalata85_db_user:HiFuViqHUkngCyj3@cluster0.0fzmn63.mongodb.net/prplus?retryWrites=true&w=majority&appName=Cluster0",
  "mongodb+srv://rohitguchhait:rohit2004@cluster0.0fzmn63.mongodb.net/prplus?retryWrites=true&w=majority&appName=Cluster0",
];

async function testWithIpv4(uri, label) {
  console.log(`\nTesting ${label} with IPv4 preference...`);
  try {
    const conn = await mongoose.connect(uri, {
      dbName: "prplus",
      serverSelectionTimeoutMS: 5000,
      family: 4,
    });
    console.log(`🎉 SUCCESS! Connected to Atlas host: ${conn.connection.host}`);
    const collections = await conn.connection.db.listCollections().toArray();
    console.log("Active Collections in Atlas:", collections.map(c => c.name));
    await mongoose.disconnect();
    return true;
  } catch (err) {
    console.error(`❌ Failed:`, err.message);
    return false;
  }
}

async function main() {
  for (let i = 0; i < uris.length; i++) {
    await testWithIpv4(uris[i], `URI #${i + 1}`);
  }
}

main();
