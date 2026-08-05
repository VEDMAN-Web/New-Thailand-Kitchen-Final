import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const mongoConfigured = Boolean(
    process.env.MONGO_URI?.trim() || process.env.MONGODB_URI?.trim()
  );

  return NextResponse.json({
    ok: true,
    mongoConfigured,
    hint: mongoConfigured
      ? "MONGO_URI is set on this deployment."
      : "MONGO_URI is NOT set. Add it in Vercel → Settings → Environment Variables (Production), then Redeploy.",
  });
}
