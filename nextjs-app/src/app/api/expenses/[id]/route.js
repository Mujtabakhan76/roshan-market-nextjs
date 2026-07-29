import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { isLoggedIn } from "@/lib/auth";

export async function DELETE(req, { params }) {
  if (!isLoggedIn()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const db = await getDb();
  await db.collection("expenses").deleteOne({ _id: new ObjectId(params.id) });
  return NextResponse.json({ ok: true });
}
