"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import VoiceRecorder from "./VoiceRecorder";
import TranscriptViewer from "./TranscriptViewer";
import DetectedFields from "./DetectedFields";
import { transcribeAudio, extractFromTranscript } from "@/lib/api";
import type { DoctorRegistrationData } from "@/lib/types";

interface VoiceRegistrationProps {
  onComplete: (data: Partial<DoctorRegistrationData>) => void;
}

export default function VoiceRegistration({ onComplete }: VoiceRegistrationProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [extractedData, setExtractedData] = useState<Partial<DoctorRegistrationData> | null>(null);
  const [confidence, setConfidence] = useState(0);
  const [entities, setEntities] = useState<Record<string, string | null>>({});
  const [error, setError] = useState<string | null>(null);

  const handleRecordingComplete = async (audioBlob: Blob) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Step 1: Transcribe audio
      const transcriptionResult = await transcribeAudio(audioBlob);

      if (!transcriptionResult.success || !transcriptionResult.transcript) {
        setError("Could not transcribe audio. Please try again with clear speech.");
        setIsProcessing(false);
        return;
      }

      setTranscript(transcriptionResult.transcript);

      // Step 2: Extract entities from transcript
      const extractionResult = await extractFromTranscript(transcriptionResult.transcript);

      if (extractionResult.success && extractionResult.data) {
        setExtractedData(extractionResult.data);
        setConfidence(extractionResult.confidence || 0);
        setEntities(extractionResult.entities || {});
      } else {
        setError("Could not extract details from the transcript. You can still fill the form manually.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Processing failed";
      setError(message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          AI Voice Registration
        </h2>
        <p className="text-sm text-gray-500">
          Record your details and our AI will extract the information automatically
        </p>
      </div>

      {/* Voice Recorder */}
      <div className="mb-8">
        <VoiceRecorder
          onRecordingComplete={handleRecordingComplete}
          isProcessing={isProcessing}
        />
      </div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 p-4 bg-red-50 border border-red-100 rounded-xl"
        >
          <p className="text-sm text-red-700">{error}</p>
        </motion.div>
      )}

      {/* Results */}
      {(transcript || isProcessing) && (
        <div className="space-y-4 mb-6">
          <TranscriptViewer transcript={transcript} isLoading={isProcessing && !transcript} />
          {extractedData && (
            <DetectedFields
              data={extractedData}
              confidence={confidence}
              entities={entities}
            />
          )}
        </div>
      )}

      {/* Continue to form */}
      {extractedData && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center"
        >
          <button
            onClick={() => onComplete(extractedData)}
            className="flex items-center gap-2 px-6 py-3 bg-drx-600 text-white rounded-xl font-semibold hover:bg-drx-700 transition-colors shadow-lg shadow-drx-200"
          >
            Continue to Edit Form
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      )}
    </div>
  );
}
