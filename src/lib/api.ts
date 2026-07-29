/**
 * API client for DRX Backend (via Next.js API proxy)
 */

const API_BASE_URL = "";

export interface TranscriptionResponse {
  success: boolean;
  transcript: string;
  language?: string;
  duration?: number;
}

export interface LocationData {
  latitude: string;
  longitude: string;
  address: string;
  city: string;
  state: string;
  country: string;
}

export interface DoctorRegistrationData {
  name: string;
  email: string;
  phone: string;
  hospital: string;
  department: string;
  location?: LocationData;
}

export interface ExtractionResponse {
  success: boolean;
  data: DoctorRegistrationData;
  transcript?: string;
  entities?: Record<string, string | null>;
  confidence?: number;
  pipeline_steps?: Array<{ step: string; result: unknown }>;
}

/**
 * Transcribe audio file to text
 */
export async function transcribeAudio(audioBlob: Blob): Promise<TranscriptionResponse> {
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

/**
 * Extract doctor data from transcript
 */
export async function extractFromTranscript(transcript: string): Promise<ExtractionResponse> {
  const response = await fetch(`${API_BASE_URL}/api/voice/extract`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ transcript }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Extraction failed" }));
    throw new Error(error.detail || "Extraction failed");
  }

  return response.json();
}

/**
 * Full pipeline: Audio → Transcript → Extraction
 */
export async function processAudio(audioBlob: Blob): Promise<ExtractionResponse> {
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

/**
 * Search location using Nominatim API (OpenStreetMap)
 */
export async function searchLocation(query: string): Promise<NominatimResult[]> {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
    {
      headers: {
        "Accept-Language": "en",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Location search failed");
  }

  return response.json();
}

/**
 * Reverse geocode coordinates to address
 */
export async function reverseGeocode(lat: number, lon: number): Promise<NominatimResult> {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`,
    {
      headers: {
        "Accept-Language": "en",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Reverse geocoding failed");
  }

  return response.json();
}

export interface NominatimResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    road?: string;
    suburb?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
}
