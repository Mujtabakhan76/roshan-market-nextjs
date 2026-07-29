import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
let client;
let clientPromise;

if (!uri) {
  // Sirf runtime (deploy hone ke baad) pe error dikhaye ga — build fail nahi hoga
  console.warn("MONGODB_URI .env.local mein set nahi ہے۔");
}

if (process.env.NODE_ENV === "development") {
  // Dev mein hot-reload se bar bar naya connection na bane, is liye global cache
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export async function getDb() {
  const c = await clientPromise;
  const db = c.db("market_rent_db");
  // Indexes — safe to call every time, no-op if already present
  await db.collection("payments").createIndex(
    { shop_id: 1, month: 1, year: 1 },
    { unique: true }
  );
  await db.collection("shops").createIndex({ status: 1 });
  await db.collection("expenses").createIndex({ date: 1 });
  return db;
}
