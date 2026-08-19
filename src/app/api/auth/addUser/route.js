import { NextResponse } from "next/server";
import { PROXZAR_BASE } from "../../_config";

export async function POST(request) {
  try {
    const body = await request.json();

    console.log(`[DOBO] OAuth addUser request for: ${body.UserName}`);

    const response = await fetch(`${PROXZAR_BASE}/api/v1/addUser`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.log(`[DOBO] OAuth addUser FAILED (${response.status}):`, JSON.stringify(data));
      return NextResponse.json(data, { status: response.status });
    }

    console.log(`[DOBO] OAuth addUser SUCCESS for: ${body.UserName}`);
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error(`[DOBO] OAuth addUser ERROR:`, error?.message);
    return NextResponse.json({ detail: "Authentication service unavailable" }, { status: 503 });
  }
}
