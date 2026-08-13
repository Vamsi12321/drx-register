import { NextResponse } from "next/server";

const BACKEND_URL = (process.env.BACKEND_URL || "http://localhost:8000").trim();
const API_PREFIX = (process.env.BACKEND_API_PREFIX || "/api").trim();

export async function GET(request, { params }) {
  const path = (await params).path.join("/");
  return proxyRequest(request, path, "GET");
}

export async function POST(request, { params }) {
  const path = (await params).path.join("/");
  return proxyRequest(request, path, "POST");
}

export async function PUT(request, { params }) {
  const path = (await params).path.join("/");
  return proxyRequest(request, path, "PUT");
}

export async function DELETE(request, { params }) {
  const path = (await params).path.join("/");
  return proxyRequest(request, path, "DELETE");
}

async function proxyRequest(request, path, method) {
  try {
    const url = `${BACKEND_URL}${API_PREFIX}/${path}`;
    const headers = { "ngrok-skip-browser-warning": "true" };

    let body = null;
    const contentType = request.headers.get("content-type") || "";

    if (method !== "GET") {
      if (contentType.includes("multipart/form-data")) {
        // File upload — reconstruct FormData
        const formData = await request.formData();
        const backendFormData = new FormData();
        for (const [key, value] of formData.entries()) {
          if (value instanceof File) {
            backendFormData.append(key, value, value.name);
          } else {
            backendFormData.append(key, value);
          }
        }
        body = backendFormData;
      } else if (contentType.includes("application/json")) {
        // JSON body
        const json = await request.json();
        body = JSON.stringify(json);
        headers["Content-Type"] = "application/json";
      } else {
        // Raw body
        body = await request.text();
        if (contentType) headers["Content-Type"] = contentType;
      }
    }

    const response = await fetch(url, {
      method,
      headers,
      body,
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error(`Proxy error [${method} /api/${path}]:`, error?.message || error);
    return NextResponse.json(
      { success: false, detail: "Backend service unavailable" },
      { status: 503 }
    );
  }
}
