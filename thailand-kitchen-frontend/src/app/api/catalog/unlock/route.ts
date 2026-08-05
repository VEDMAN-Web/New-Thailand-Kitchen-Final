import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COOKIE = "tk_catalog_access";
const MAX_AGE = 60 * 60 * 24; // 24 hours

export async function POST() {
  const res = NextResponse.json({
    success: true,
    unlocked: true,
    message: "Catalogue download unlocked",
  });

  res.cookies.set(COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });

  return res;
}
