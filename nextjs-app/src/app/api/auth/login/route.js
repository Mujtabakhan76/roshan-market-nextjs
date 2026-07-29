import { NextResponse } from "next/server";
import { getSettings } from "@/lib/settings";
import { loginCookieOptions } from "@/lib/auth";

export async function POST(req) {
  const { password } = await req.json();
  const settings = await getSettings();

  if (password !== settings.admin_password) {
    return NextResponse.json({ ok: false, error: "غلط پاس ورڈ" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  const c = loginCookieOptions();
  res.cookies.set(c.name, c.value, c);
  return res;
}
