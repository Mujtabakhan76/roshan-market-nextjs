import { NextResponse } from "next/server";
import { isLoggedIn } from "@/lib/auth";
import { sendWhatsApp } from "@/lib/whatsapp";

export async function POST(req) {
  if (!isLoggedIn()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const { mobile, message } = await req.json();
    if (!mobile || !message) {
      return NextResponse.json({ error: "نمبر اور پیغام دونوں ضروری ہیں" }, { status: 400 });
    }
    const result = await sendWhatsApp(mobile, message);
    if (result.ok) return NextResponse.json({ ok: true });
    return NextResponse.json({ ok: false, error: result.reason }, { status: 400 });
  } catch (e) {
    console.error("POST /api/whatsapp/send failed:", e);
    return NextResponse.json({ error: "پیغام بھیجنے میں خرابی" }, { status: 500 });
  }
}
