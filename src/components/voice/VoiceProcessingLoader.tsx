"use client";

import { motion } from "framer-motion";
import { Brain, Mic, FileText, Sparkles } from "lucide-react";

interface VoiceProcessingLoaderProps {
  stage: "transcribing" | "extracting" | "complete";
}

const stages = [
  { key: "transcribing", label: "Transcribing audio...", icon: Mic, sublabel: "Faster-Whisper processing" },
  { key: "extracting", label: "Extracting details...", icon: Brain, sublabel: "AI analyzing transcript" },
  { key: "complete", label: "Done!", icon: Sparkles, sublabel: "Data extracted successfully" },
];

export default function VoiceProcessingLoader({ stage }: VoiceProcessingLoaderProps) {
  const currentIndex = stages.findIndex((s) => s.key === stage);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 bg-white rounded-2xl border border-drx-100 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-drx-100 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-drx-600 border-t-transparent rounded-full animate-spin" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">Processing your recording</p>
          <p className="text-xs text-gray-500">This may take a few seconds</p>
        </div>
      </div>

      {/* Pipeline steps */}
      <div className="space-y-3">
        {stages.map((s, index) => {
          const isActive = index === currentIndex;
          const isDone = index < currentIndex;
          const isPending = index > currentIndex;
          const Icon = s.icon;

          return (
            <div
              key={s.key}
              className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                isActive ? "bg-drx-50 border border-drx-100" : ""
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isDone
                    ? "bg-green-100"
                    : isActive
                    ? "bg-drx-100"
                    : "bg-gray-100"
                }`}
              >
                {isDone ? (
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-drx-600" : "text-gray-400"}`} />
                )}
              </div>
              <div>
                <p className={`text-sm ${isDone ? "text-green-700" : isActive ? "text-drx-700 font-medium" : "text-gray-400"}`}>
                  {s.label}
                </p>
                <p className={`text-xs ${isDone ? "text-green-500" : isActive ? "text-drx-500" : "text-gray-300"}`}>
                  {s.sublabel}
                </p>
              </div>
              {isActive && (
                <div className="ml-auto w-3 h-3 border-2 border-drx-500 border-t-transparent rounded-full animate-spin" />
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
