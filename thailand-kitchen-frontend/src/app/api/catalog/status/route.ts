import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COOKIE = "tk_catalog_access";

export async function GET() {
  const jar = await cookies();
  const unlocked = jar.get(COOKIE)?.value === "1";

  return NextResponse.json({ unlocked });
}
