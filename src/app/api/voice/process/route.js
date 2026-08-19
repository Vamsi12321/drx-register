import { NextResponse } from "next/server";
import { API_BASE } from "../../_config";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!file) return NextResponse.json({ success: false, detail: "No audio file provided" }, { status: 400 });

    const backendFormData = new FormData();
    backendFormData.append("file", file, file.name);

    const response = await fetch(`${API_BASE}/voice/process`, {
      method: "POST",
      body: backendFormData,
      headers: { "ngrok-skip-browser-warning": "true" },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Process proxy error:", error);
    return NextResponse.json({ success: false, detail: "Backend service unavailable" }, { status: 503 });
  }
}
