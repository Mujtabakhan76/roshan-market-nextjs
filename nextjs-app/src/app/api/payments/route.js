import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { isLoggedIn } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { sendWhatsApp } from "@/lib/whatsapp";
import { MONTHS_UR, fmt } from "@/lib/utils";

export async function GET() {
  if (!isLoggedIn()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const db = await getDb();
  const payments = await db.collection("payments").find({}).toArray();
  return NextResponse.json(payments);
}

// ادائیگی محفوظ کرنا — نیا ریکارڈ بنائے یا موجودہ اپڈیٹ کرے، پھر WhatsApp بھیجے
export async function POST(req) {
  if (!isLoggedIn()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json();
  const { shop_id, month, year, paid_amount, method, payment_date } = body;

  const db = await getDb();
  const shop = await db.collection("shops").findOne({ _id: new ObjectId(shop_id) });
  if (!shop) return NextResponse.json({ error: "دکان نہیں ملی" }, { status: 404 });

  const existing = await db.collection("payments").findOne({ shop_id: String(shop_id), month, year });
  const totalRent = existing ? existing.total_rent : shop.monthly_rent;

  if (existing) {
    await db.collection("payments").updateOne(
      { _id: existing._id },
      { $set: { paid_amount: Number(paid_amount), method, payment_date } }
    );
  } else {
    await db.collection("payments").insertOne({
      shop_id: String(shop_id), month, year,
      total_rent: totalRent, paid_amount: Number(paid_amount), method, payment_date,
    });
  }

  const settings = await getSettings();
  const due = Math.max(totalRent - Number(paid_amount), 0);
  const dateObj = payment_date ? new Date(payment_date) : new Date();
  const dateStr = `${String(dateObj.getDate()).padStart(2,"0")}-${String(dateObj.getMonth()+1).padStart(2,"0")}-${dateObj.getFullYear()}`;

  let whatsappResult = { ok: false, reason: "sms_disabled" };
  if (settings.sms_enabled) {
    const msg =
      `السلام علیکم ${shop.tenant_name} صاحب\n\n` +
      `تاریخ: ${dateStr}\n` +
      `دکان نمبر: ${shop.number}\n` +
      `دکان کا نام: ${shop.name}\n\n` +
      `وصول شدہ رقم: ${fmt(paid_amount)} روپے\n` +
      `باقی رقم: ${fmt(due)} روپے\n\n` +
      `کرایہ وصول کرنے والا: ${settings.collector_name}\n\n` +
      `شکریہ\n${settings.market_name}`;
    whatsappResult = await sendWhatsApp(shop.mobile, msg);
  }

  return NextResponse.json({ ok: true, due, whatsapp: whatsappResult });
}
