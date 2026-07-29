import { NextResponse } from "next/server";
import { isLoggedIn } from "@/lib/auth";
import { getSettings, updateSettings } from "@/lib/settings";

export async function GET() {
  if (!isLoggedIn()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const settings = await getSettings();
  const { admin_password, ...safe } = settings; // password kabhi client کو واپس نہ بھیجیں
  return NextResponse.json(safe);
}

export async function PUT(req) {
  if (!isLoggedIn()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json();

  if (body.new_password) {
    const settings = await getSettings();
    if (body.old_password !== settings.admin_password) {
      return NextResponse.json({ error: "موجودہ پاس ورڈ غلط ہے" }, { status: 400 });
    }
    if (body.new_password.length < 4) {
      return NextResponse.json({ error: "نیا پاس ورڈ کم از کم 4 حروف کا ہو" }, { status: 400 });
    }
    await updateSettings({ admin_password: body.new_password });
    return NextResponse.json({ ok: true });
  }

  const patch = {};
  if (body.market_name !== undefined) patch.market_name = body.market_name;
  if (body.collector_name !== undefined) patch.collector_name = body.collector_name;
  if (body.sms_enabled !== undefined) patch.sms_enabled = body.sms_enabled;
  await updateSettings(patch);
  return NextResponse.json({ ok: true });
}
