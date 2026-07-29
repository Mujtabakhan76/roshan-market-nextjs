import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { isLoggedIn } from "@/lib/auth";

async function seedDemoIfEmpty(db) {
  const count = await db.collection("shops").countDocuments({});
  if (count === 0) {
    await db.collection("shops").insertMany([
      { number: "1", name: "الکریم جنرل اسٹور", tenant_name: "محمد اسلم", mobile: "03001234567", cnic: "", monthly_rent: 15000, status: "rented" },
      { number: "2", name: "فیصل کلاتھ ہاؤس", tenant_name: "فیصل رشید", mobile: "03011234567", cnic: "", monthly_rent: 22000, status: "rented" },
      { number: "3", name: "—", tenant_name: "—", mobile: "", cnic: "", monthly_rent: 0, status: "empty" },
    ]);
  }
}

export async function GET() {
  if (!isLoggedIn()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const db = await getDb();
  await seedDemoIfEmpty(db);
  const shops = await db.collection("shops").find({}).sort({ number: 1 }).toArray();
  return NextResponse.json(shops);
}

export async function POST(req) {
  if (!isLoggedIn()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json();
  const { number, name, tenant_name, mobile, cnic, monthly_rent, status } = body;

  if (!number || !tenant_name || !mobile || !monthly_rent || monthly_rent <= 0) {
    return NextResponse.json({ error: "لازمی خانے پُر کریں" }, { status: 400 });
  }

  const db = await getDb();
  const result = await db.collection("shops").insertOne({
    number, name: name || "—", tenant_name, mobile,
    cnic: cnic || "", monthly_rent: Number(monthly_rent), status: status || "rented",
  });
  return NextResponse.json({ ok: true, id: result.insertedId });
}
