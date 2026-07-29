"use client";

import { motion } from "framer-motion";
import { FileText, CheckCircle2 } from "lucide-react";

interface TranscriptViewerProps {
  transcript: string;
  isLoading?: boolean;
}

export default function TranscriptViewer({ transcript, isLoading = false }: TranscriptViewerProps) {
  if (isLoading) {
    return (
      <div className="p-4 bg-white rounded-xl border border-gray-200 animate-pulse">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 bg-gray-200 rounded" />
          <div className="h-4 w-24 bg-gray-200 rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-full" />
          <div className="h-3 bg-gray-200 rounded w-4/5" />
          <div className="h-3 bg-gray-200 rounded w-3/5" />
        </div>
      </div>
    );
  }

  if (!transcript) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-3">
        <FileText className="w-5 h-5 text-drx-600" />
        <h3 className="font-semibold text-gray-900 text-sm">Transcript</h3>
        <CheckCircle2 className="w-4 h-4 text-green-500 ml-auto" />
      </div>
      <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg">
        {transcript}
      </p>
    </motion.div>
  );
}
