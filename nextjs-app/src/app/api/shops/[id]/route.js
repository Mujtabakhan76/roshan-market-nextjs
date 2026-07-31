import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { isLoggedIn } from "@/lib/auth";

export async function PUT(req, { params }) {
  if (!isLoggedIn()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json();
  const db = await getDb();
  await db.collection("shops").updateOne(
    { _id: new ObjectId(params.id) },
    { $set: {
        number: body.number, name: body.name, tenant_name: body.tenant_name, mobile: body.mobile,
        cnic: body.cnic || "", monthly_rent: Number(body.monthly_rent), status: body.status,
      } }
  );
  return NextResponse.json({ ok: true });
}

export async function DELETE(req, { params }) {
  if (!isLoggedIn()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const db = await getDb();
  const shopId = new ObjectId(params.id);
  await db.collection("shops").deleteOne({ _id: shopId });
  // shop_id ho sakta hai string ya ObjectId کی صورت میں محفوظ ہو — دونوں صورتیں صاف کریں
  await db.collection("payments").deleteMany({ shop_id: { $in: [shopId.toString(), shopId] } });
  return NextResponse.json({ ok: true });
}
