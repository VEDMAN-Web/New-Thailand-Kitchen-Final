import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 15;

/**
 * Proxy to Express so website + admin Contacts share one Mongo collection.
 * Prefer calling /cms-api/contact/post from the client; this keeps /api/contact/post working.
 */
export async function POST(request: Request) {
  try {
    const backend = (
      process.env.BACKEND_URL?.trim() || "http://127.0.0.1:5000"
    ).replace(/\/+$/, "");

    const body = await request.text();
    const upstream = await fetch(`${backend}/api/contact/post`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    const text = await upstream.text();
    let json: unknown = {};
    try {
      json = text ? JSON.parse(text) : {};
    } catch {
      json = { success: false, message: text || "Invalid upstream response" };
    }

    return NextResponse.json(json, { status: upstream.status });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to submit contact form (API unreachable)";
    console.error("Contact POST proxy error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          message.includes("ECONNREFUSED") || message.includes("fetch failed")
            ? "Contact API is offline. Start the Express server on port 5000."
            : message,
      },
      { status: 502 }
    );
  }
}
