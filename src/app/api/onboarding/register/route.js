import { NextResponse } from "next/server";
import { API_BASE } from "../../_config";

export async function POST(request) {
  try {
    const body = await request.json();
    const response = await fetch(`${API_BASE}/onboarding/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Onboarding register proxy error:", error);
    return NextResponse.json({ success: false, detail: "Backend service unavailable" }, { status: 503 });
  }
}
