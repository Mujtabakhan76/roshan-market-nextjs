import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { isLoggedIn } from "@/lib/auth";

export async function GET() {
  if (!isLoggedIn()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const db = await getDb();
  const expenses = await db.collection("expenses").find({}).sort({ date: -1 }).toArray();
  return NextResponse.json(expenses);
}

export async function POST(req) {
  if (!isLoggedIn()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { description, amount, date } = await req.json();
  if (!description || !amount || amount <= 0) {
    return NextResponse.json({ error: "تفصیل اور رقم درج کریں" }, { status: 400 });
  }
  const db = await getDb();
  await db.collection("expenses").insertOne({ description, amount: Number(amount), date });
  return NextResponse.json({ ok: true });
}
