import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COOKIE = "tk_catalog_access";
const MAX_AGE = 60 * 60 * 24; // 24 hours

function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validatePhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 9;
}

export async function POST(request: NextRequest) {
  let body: { fullName?: string; email?: string; phone?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid request body" },
      { status: 400 }
    );
  }

  const fullName = String(body.fullName || "").trim();
  const email = String(body.email || "").trim();
  const phone = String(body.phone || "").trim();

  // Server-side validation
  if (!fullName || fullName.length < 2) {
    return NextResponse.json(
      { success: false, message: "Full name is required (minimum 2 characters)" },
      { status: 400 }
    );
  }

  if (!email && !phone) {
    return NextResponse.json(
      { success: false, message: "Email or phone number is required" },
      { status: 400 }
    );
  }

  if (email && !validateEmail(email)) {
    return NextResponse.json(
      { success: false, message: "Invalid email address" },
      { status: 400 }
    );
  }

  if (phone && !validatePhone(phone)) {
    return NextResponse.json(
      { success: false, message: "Invalid phone number (minimum 9 digits)" },
      { status: 400 }
    );
  }

  // Submit lead through existing contact API
  const phoneDigits = phone.replace(/\D/g, "");
  const fallbackPhone = phoneDigits || "0000000000";
  const fallbackEmail =
    email || `catalogue.${fallbackPhone}@thailandkitchens.lead`;

  const contactPayload = {
    fullName,
    email: fallbackEmail,
    phoneCode: "+66",
    phoneNumber: fallbackPhone,
    whatsappNumber: fallbackPhone,
    cityName: "Catalogue Lead",
    countryName: "Catalogue Lead",
    message: `Catalogue download request from ${fullName}. Contact: ${email || "no email"} / ${phone || "no phone"}.`,
  };

  try {
    // Call backend contact API
    const backendUrl =
      process.env.BACKEND_URL?.trim() || "http://127.0.0.1:5000";
    const contactRes = await fetch(`${backendUrl.replace(/\/+$/, "")}/api/contact/post`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(contactPayload),
    });

    if (!contactRes.ok) {
      const errorData = await contactRes.json().catch(() => ({}));
      return NextResponse.json(
        {
          success: false,
          message: errorData.message || "Failed to submit contact information",
        },
        { status: contactRes.status }
      );
    }
  } catch (err) {
    console.error("[catalog/unlock] Contact API error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to submit contact information" },
      { status: 500 }
    );
  }

  // Only set cookie after successful lead submission
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
