import { NextResponse } from "next/server";

const BACKEND_URL = (process.env.BACKEND_URL || "http://localhost:8000").trim();

export async function POST(request) {
  try {
    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/api/onboarding/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Onboarding register proxy error:", error);
    return NextResponse.json(
      { detail: "Backend service unavailable" },
      { status: 503 }
    );
  }
}
