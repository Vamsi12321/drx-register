import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, detail: "No audio file provided" },
        { status: 400 }
      );
    }

    // Reconstruct FormData for backend
    const backendFormData = new FormData();
    backendFormData.append("file", file, file.name);

    const response = await fetch(`${BACKEND_URL}/api/voice/process`, {
      method: "POST",
      body: backendFormData,
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Process proxy error:", error);
    return NextResponse.json(
      { success: false, detail: "Backend service unavailable" },
      { status: 503 }
    );
  }
}
