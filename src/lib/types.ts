/**
 * Shared TypeScript types for DRX Doctor Registration
 */

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
  location: LocationData;
}

export interface TranscriptionResult {
  success: boolean;
  transcript: string;
  language?: string;
  duration?: number;
}

export interface ExtractionResult {
  success: boolean;
  data: DoctorRegistrationData;
  transcript?: string;
  entities?: Record<string, string | null>;
  confidence?: number;
  pipeline_steps?: PipelineStep[];
}

export interface PipelineStep {
  step: string;
  result: unknown;
}

export type RegistrationMethod = "manual" | "voice";

export type RecordingState = "idle" | "recording" | "stopped" | "processing";
