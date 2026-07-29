import { cookies } from "next/headers";

const COOKIE_NAME = "roshan_session";

export function isLoggedIn() {
  const store = cookies();
  return store.get(COOKIE_NAME)?.value === "ok";
}

export function loginCookieOptions() {
  return {
    name: COOKIE_NAME,
    value: "ok",
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 din
  };
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
