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
  // Indexes performance behtar karte hain, lekin agar (کسی پرانی duplicate
  // entry کی وجہ سے) index بننے میں مسئلہ ہو تو پوری API fail نہیں ہونی
  // چاہیے — اسی وجہ سے ہر index الگ سے، غیر-fatal طریقے سے بنایا جاتا ہے۔
  await safeCreateIndex(db, "payments", { shop_id: 1, month: 1, year: 1 }, { unique: true });
  await safeCreateIndex(db, "shops", { status: 1 });
  await safeCreateIndex(db, "expenses", { date: 1 });
  return db;
}

async function safeCreateIndex(db, collection, spec, options = {}) {
  try {
    await db.collection(collection).createIndex(spec, options);
  } catch (e) {
    // Index conflict (مثلاً پرانی duplicate entries) کبھی بھی پوری ایپ کو
    // نہیں روکنی چاہیے — صرف لاگ کریں اور آگے بڑھیں۔
    console.error(`Index warning on "${collection}":`, e.message);
  }
}
