/**
 * NEXORA PULSECARE - MONGODB CLIENT SERVICE
 * Handles MongoDB Atlas connections and collection helpers.
 */

const { MongoClient, ServerApiVersion } = require("mongodb");

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://vishwakarmalata85_db_user:HiFuViqHUkngCyj3@cluster0.0fzmn63.mongodb.net/prplus?retryWrites=true&w=majority&appName=Cluster0";


let client = null;
let db = null;

/**
 * Connect to MongoDB Atlas
 * @param {string} [customUri] - Optional override connection URI
 * @param {string} [dbName='prplus'] - Database name
 * @returns {Promise<{ client: MongoClient, db: any }>}
 */
async function connectToMongo(customUri = MONGODB_URI, dbName = "prplus") {
  if (db && client) {
    return { client, db };
  }

  if (customUri.includes("<CLUSTER_HOST>")) {
    throw new Error(
      "MongoDB Connection Error: Please replace <CLUSTER_HOST> with your actual MongoDB Atlas cluster hostname (e.g. cluster0.abcde.mongodb.net) in .env or connection string."
    );
  }

  client = new MongoClient(customUri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

  await client.connect();
  db = client.db(dbName);
  console.log(`✅ Successfully connected to MongoDB database: ${dbName}`);
  return { client, db };
}

/**
 * Get MongoDB Database instance
 */
function getDb() {
  if (!db) {
    throw new Error("Database not connected. Call connectToMongo() first.");
  }
  return db;
}

/**
 * Close MongoDB connection gracefully
 */
async function closeMongo() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log("MongoDB connection closed.");
  }
}

module.exports = {
  connectToMongo,
  getDb,
  closeMongo
};
