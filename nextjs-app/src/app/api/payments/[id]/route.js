import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { isLoggedIn } from "@/lib/auth";

export async function DELETE(req, { params }) {
  if (!isLoggedIn()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const db = await getDb();
    const result = await db.collection("payments").deleteOne({ _id: new ObjectId(params.id) });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "ریکارڈ نہیں ملا" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/payments/[id] failed:", e);
    return NextResponse.json({ error: "حذف کرنے میں خرابی" }, { status: 500 });
  }
}
