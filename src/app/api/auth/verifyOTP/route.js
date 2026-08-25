import { NextResponse } from "next/server";
import { PROXZAR_BASE } from "../../_config";

export async function POST(request) {
  try {
    const body = await request.json();

    console.log(`[DOBO] OTP verify request for: ${body.UserEmail}`);

    const response = await fetch(`${PROXZAR_BASE}/api/v1/verifyEmailOTP`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.log(`[DOBO] OTP verify FAILED (${response.status}):`, JSON.stringify(data));
      return NextResponse.json(data, { status: response.status });
    }

    console.log(`[DOBO] OTP verify SUCCESS for: ${body.UserEmail}`);
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error(`[DOBO] OTP verify ERROR:`, error?.message);
    return NextResponse.json({ detail: "Verification service unavailable" }, { status: 503 });
  }
}
