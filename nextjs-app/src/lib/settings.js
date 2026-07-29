import { getDb } from "./mongodb";

const DEFAULTS = {
  _id: "config",
  market_name: "روشن مارکیٹ",
  collector_name: "مولانا عدنان صاحب",
  admin_password: "admin123",
  sms_enabled: true,
};

export async function getSettings() {
  const db = await getDb();
  let s = await db.collection("settings").findOne({ _id: "config" });
  if (!s) {
    await db.collection("settings").insertOne(DEFAULTS);
    s = DEFAULTS;
  }
  // Purani documents mein naye fields shamil karo agar missing hon
  const patch = {};
  for (const key of Object.keys(DEFAULTS)) {
    if (!(key in s)) patch[key] = DEFAULTS[key];
  }
  if (Object.keys(patch).length) {
    await db.collection("settings").updateOne({ _id: "config" }, { $set: patch });
    Object.assign(s, patch);
  }
  return s;
}

export async function updateSettings(patch) {
  const db = await getDb();
  await db.collection("settings").updateOne({ _id: "config" }, { $set: patch }, { upsert: true });
}
