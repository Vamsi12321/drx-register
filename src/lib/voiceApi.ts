/**
 * Voice Registration API Service
 * Handles communication with FastAPI backend for voice-based registration.
 * 
 * Backend pipeline (handled server-side):
 * Audio → Faster-Whisper (multilingual STT) → Language Detection →
 * Translation (if Telugu/Hindi/etc.) → Regex → spaCy NER → Gemini Flash → JSON
 * 
 * Supported languages: English, Hindi, Telugu
 */

export interface TranscribeResponse {
  transcript: string;
  language?: string;
  duration?: number;
}

export interface ExtractResponse {
  name: string;
  email: string;
  phone: string;
  hospital: string;
  department: string;
}

export interface VoiceApiError {
  detail: string;
  code?: string;
}

class VoiceApiService {
  private baseUrl: string;

  constructor() {
    // Uses Next.js API proxy routes — no direct backend URL needed
    this.baseUrl = "";
  }

  /**
   * POST /api/voice/transcribe
   * Sends audio file for speech-to-text processing.
   * Backend handles: Faster-Whisper → Language Detection → Translation
   */
  async transcribe(audioBlob: Blob): Promise<TranscribeResponse> {
    const formData = new FormData();
    formData.append("file", audioBlob, "recording.webm");

    const response = await fetch(`${this.baseUrl}/api/voice/transcribe`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await this.parseError(response);
      throw new VoiceServiceError(error.detail, response.status);
    }

    const data = await response.json();
    return {
      transcript: data.transcript || "",
      language: data.language,
      duration: data.duration,
    };
  }

  /**
   * POST /api/voice/extract
   * Sends transcript for entity extraction.
   * Backend handles: Regex → spaCy NER → Gemini Flash validation
   */
  async extract(transcript: string): Promise<ExtractResponse> {
    const response = await fetch(`${this.baseUrl}/api/voice/extract`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript }),
    });

    if (!response.ok) {
      const error = await this.parseError(response);
      throw new VoiceServiceError(error.detail, response.status);
    }

    const data = await response.json();

    // Normalize response - handle both flat and nested formats
    const extracted = data.data || data;
    return {
      name: extracted.name || "",
      email: extracted.email || "",
      phone: extracted.phone || "",
      hospital: extracted.hospital || "",
      department: extracted.department || "",
    };
  }

  /**
   * Full pipeline: Audio → Transcribe → Extract
   * Convenience method that chains both API calls.
   */
  async processAudio(audioBlob: Blob): Promise<{
    transcript: string;
    data: ExtractResponse;
    language?: string;
  }> {
    // Step 1: Transcribe
    const transcription = await this.transcribe(audioBlob);

    if (!transcription.transcript.trim()) {
      throw new VoiceServiceError(
        "Could not detect speech in the recording. Please speak clearly and try again.",
        400
      );
    }

    // Step 2: Extract
    const extracted = await this.extract(transcription.transcript);

    return {
      transcript: transcription.transcript,
      data: extracted,
      language: transcription.language,
    };
  }

  private async parseError(response: Response): Promise<VoiceApiError> {
    try {
      const data = await response.json();
      return { detail: data.detail || "An error occurred", code: data.code };
    } catch {
      if (response.status === 503) {
        return { detail: "Backend service is unavailable. Please try again later." };
      }
      if (response.status === 413) {
        return { detail: "Recording is too large. Please keep it under 2 minutes." };
      }
      return { detail: `Request failed (${response.status})` };
    }
  }
}

export class VoiceServiceError extends Error {
  public status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "VoiceServiceError";
    this.status = status;
  }
}

// Singleton instance
export const voiceApi = new VoiceApiService();
