const mongoose = require('mongoose');

/**
 * Build a proper Mongo connection string.
 * If using an Atlas SRV URI without a database name and MONGO_DB_NAME is provided,
 * append the database segment before the query string.
 */
function buildMongoUri() {
  const raw = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/yatra360';
  const dbName = process.env.MONGO_DB_NAME; // optional explicit DB name

  if (!dbName) return raw;
  // If URI already contains a trailing database path after the host(s), leave it.
  // Detect pattern: mongodb+srv://host/possibleDbName?...
  const match = /^(mongodb(?:\+srv)?:\/\/[^/]+)(?:\/([^?]+))?(.*)$/i.exec(raw);
  if (!match) return raw; // fallback
  const [, base, existingDb, rest] = match;
  if (existingDb) return raw; // user already specified a DB
  // Insert dbName before rest (which may start with ? or be empty)
  return `${base}/${dbName}${rest}`;
}

let cachedConnection = null;
let connectingPromise = null;

async function connectMongo({ retries = 5, delayMs = 2000 } = {}) {
  if (cachedConnection) return cachedConnection;
  if (connectingPromise) return connectingPromise;

  const uri = buildMongoUri();
  let attempt = 0;

  connectingPromise = new Promise(async (resolve, reject) => {
    while (attempt <= retries) {
      try {
        attempt++;
        const conn = await mongoose.connect(uri, {
          // Add any desired Mongoose options here
          maxPoolSize: 15,
          serverSelectionTimeoutMS: 10000
        });
        console.log(`✅ MongoDB connected (${conn.connection.name})`);
        cachedConnection = conn;
        return resolve(conn);
      } catch (err) {
        console.error(`❌ Mongo connect attempt ${attempt} failed:`, err.message);
        if (attempt > retries) {
          return reject(err);
        }
        await new Promise(r => setTimeout(r, delayMs));
      }
    }
  });

  return connectingPromise;
}

module.exports = { connectMongo, buildMongoUri };
