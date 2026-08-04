/**
 * API client for DRX Backend (via Next.js API proxy)
 */

const API_BASE_URL = "";

export async function transcribeAudio(audioBlob) {
  const formData = new FormData();
  formData.append("file", audioBlob, "recording.webm");

  const response = await fetch(`${API_BASE_URL}/api/voice/transcribe`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Transcription failed" }));
    throw new Error(error.detail || "Transcription failed");
  }

  return response.json();
}

export async function extractFromTranscript(transcript) {
  const response = await fetch(`${API_BASE_URL}/api/voice/extract`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transcript }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Extraction failed" }));
    throw new Error(error.detail || "Extraction failed");
  }

  return response.json();
}

export async function processAudio(audioBlob) {
  const formData = new FormData();
  formData.append("file", audioBlob, "recording.webm");

  const response = await fetch(`${API_BASE_URL}/api/voice/process`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Processing failed" }));
    throw new Error(error.detail || "Processing failed");
  }

  return response.json();
}

export async function searchLocation(query) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
    { headers: { "Accept-Language": "en" } }
  );

  if (!response.ok) throw new Error("Location search failed");
  return response.json();
}

export async function reverseGeocode(lat, lon) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`,
    { headers: { "Accept-Language": "en" } }
  );

  if (!response.ok) throw new Error("Reverse geocoding failed");
  return response.json();
}
