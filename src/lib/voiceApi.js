/**
 * Voice Registration API Service
 */

export class VoiceServiceError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "VoiceServiceError";
    this.status = status;
  }
}

class VoiceApiService {
  constructor() {
    this.baseUrl = "";
  }

  async transcribe(audioBlob) {
    const formData = new FormData();
    formData.append("file", audioBlob, "recording.webm");

    const response = await fetch(`${this.baseUrl}/api/voice/transcribe`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await this._parseError(response);
      throw new VoiceServiceError(error.detail, response.status);
    }

    const data = await response.json();
    return {
      transcript: data.transcript || "",
      language: data.language,
      duration: data.duration,
    };
  }

  async extract(transcript) {
    const response = await fetch(`${this.baseUrl}/api/voice/extract`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript }),
    });

    if (!response.ok) {
      const error = await this._parseError(response);
      throw new VoiceServiceError(error.detail, response.status);
    }

    const rawResponse = await response.json();
    const extracted = rawResponse.data || rawResponse;

    // Return normalized fields + raw response for pipeline storage
    return {
      name: extracted.name || "",
      email: extracted.email || "",
      phone: extracted.phone || "",
      hospital: extracted.hospital || "",
      department: extracted.department || "",
      // Store raw backend response for registration payload
      _rawResponse: rawResponse,
      _entities: rawResponse.entities || null,
      _confidence: rawResponse.confidence || null,
      _pipelineSteps: rawResponse.pipeline_steps || null,
    };
  }

  async processAudio(audioBlob) {
    const transcription = await this.transcribe(audioBlob);

    if (!transcription.transcript.trim()) {
      throw new VoiceServiceError(
        "Could not detect speech. Please speak clearly and try again.",
        400
      );
    }

    const extracted = await this.extract(transcription.transcript);
    return {
      transcript: transcription.transcript,
      data: extracted,
      language: transcription.language,
    };
  }

  async _parseError(response) {
    try {
      const data = await response.json();
      return { detail: data.detail || "An error occurred" };
    } catch {
      if (response.status === 503) return { detail: "Backend service unavailable." };
      if (response.status === 413) return { detail: "Recording too large. Keep it under 2 minutes." };
      return { detail: `Request failed (${response.status})` };
    }
  }
}

export const voiceApi = new VoiceApiService();
