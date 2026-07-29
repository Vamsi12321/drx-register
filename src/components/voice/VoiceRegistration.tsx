"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowRight, RefreshCw } from "lucide-react";
import VoiceRecorder from "./VoiceRecorder";
import TranscriptCard from "./TranscriptCard";
import DetectedFieldsCard from "./DetectedFieldsCard";
import VoiceProcessingLoader from "./VoiceProcessingLoader";
import Toast, { type ToastMessage } from "./Toast";
import { voiceApi, VoiceServiceError, type ExtractResponse } from "@/lib/voiceApi";
import type { DoctorRegistrationData } from "@/lib/types";

interface VoiceRegistrationProps {
  onComplete: (data: Partial<DoctorRegistrationData>) => void;
}

type ProcessingStage = "idle" | "transcribing" | "extracting" | "complete" | "error";

export default function VoiceRegistration({ onComplete }: VoiceRegistrationProps) {
  const [stage, setStage] = useState<ProcessingStage>("idle");
  const [transcript, setTranscript] = useState("");
  const [language, setLanguage] = useState<string | undefined>();
  const [extractedData, setExtractedData] = useState<ExtractResponse | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: ToastMessage["type"], title: string, message?: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, title, message }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleError = useCallback((errorMessage: string) => {
    addToast("error", "Recording Error", errorMessage);
  }, [addToast]);

  const handleRecordingComplete = async (audioBlob: Blob) => {
    setStage("transcribing");
    setTranscript("");
    setExtractedData(null);

    try {
      // Step 1: Transcribe
      const transcription = await voiceApi.transcribe(audioBlob);

      if (!transcription.transcript.trim()) {
        addToast("error", "No speech detected", "Please speak clearly and try again.");
        setStage("idle");
        return;
      }

      setTranscript(transcription.transcript);
      setLanguage(transcription.language);
      setStage("extracting");

      // Step 2: Extract
      const extracted = await voiceApi.extract(transcription.transcript);
      setExtractedData(extracted);
      setStage("complete");

      // Check how many fields were detected
      const filledCount = Object.values(extracted).filter((v) => v).length;
      if (filledCount >= 4) {
        addToast("success", "Details extracted", `${filledCount}/5 fields detected successfully.`);
      } else if (filledCount >= 2) {
        addToast("info", "Partial detection", `Only ${filledCount}/5 fields detected. You can fill the rest manually.`);
      } else {
        addToast("info", "Low detection", "Few details detected. Please fill the form manually or re-record.");
      }
    } catch (err) {
      setStage("error");

      if (err instanceof VoiceServiceError) {
        if (err.status === 503) {
          addToast("error", "Service Unavailable", "Backend is not reachable. Please check if the server is running.");
        } else {
          addToast("error", "Processing Failed", err.message);
        }
      } else if (err instanceof TypeError && err.message.includes("fetch")) {
        addToast("error", "Network Error", "Could not reach the server. Check your internet connection.");
      } else {
        addToast("error", "Unexpected Error", err instanceof Error ? err.message : "Something went wrong.");
      }
    }
  };

  const handleReset = () => {
    setStage("idle");
    setTranscript("");
    setLanguage(undefined);
    setExtractedData(null);
  };

  const handleContinue = () => {
    if (extractedData) {
      onComplete({
        name: extractedData.name,
        email: extractedData.email,
        phone: extractedData.phone,
        hospital: extractedData.hospital,
        department: extractedData.department,
      });
    }
  };

  const isProcessing = stage === "transcribing" || stage === "extracting";

  return (
    <div className="max-w-2xl mx-auto">
      {/* Toast notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-2">AI Voice Registration</h2>
        <p className="text-sm text-gray-500">
          Speak your details in English, Hindi, or Telugu. AI will handle the rest.
        </p>
      </div>

      {/* Voice Recorder — hidden when processing/complete */}
      {(stage === "idle" || stage === "error") && (
        <div className="mb-8">
          <VoiceRecorder
            onRecordingComplete={handleRecordingComplete}
            onError={handleError}
            isProcessing={isProcessing}
          />
        </div>
      )}

      {/* Processing Loader */}
      {isProcessing && (
        <div className="mb-6">
          <VoiceProcessingLoader stage={stage as "transcribing" | "extracting"} />
        </div>
      )}

      {/* Results */}
      {transcript && stage !== "transcribing" && (
        <div className="space-y-4 mb-6">
          <TranscriptCard transcript={transcript} language={language} />
          {extractedData && <DetectedFieldsCard data={extractedData} />}
        </div>
      )}

      {/* Action buttons */}
      {stage === "complete" && extractedData && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-5 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Re-record
          </button>
          <button
            onClick={handleContinue}
            className="flex items-center gap-2 px-6 py-3 bg-drx-600 text-white rounded-xl font-semibold hover:bg-drx-700 transition-colors shadow-lg shadow-drx-200"
          >
            Continue to Edit Form
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      )}

      {/* Error state retry */}
      {stage === "error" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mt-4"
        >
          <p className="text-sm text-gray-500 mb-3">
            Something went wrong. You can try recording again or switch to manual registration.
          </p>
        </motion.div>
      )}
    </div>
  );
}
