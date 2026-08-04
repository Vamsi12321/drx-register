"use client";

import { motion } from "framer-motion";
import { FileText, Globe, CheckCircle2 } from "lucide-react";

const languageLabels = { en: "English", hi: "Hindi", te: "Telugu", ta: "Tamil", kn: "Kannada", ml: "Malayalam" };

export default function TranscriptCard({ transcript, language, isLoading = false }) {
  if (isLoading) {
    return (
      <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm animate-pulse">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 bg-gray-200 rounded" />
          <div className="h-4 w-32 bg-gray-200 rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-100 rounded w-full" />
          <div className="h-3 bg-gray-100 rounded w-4/5" />
          <div className="h-3 bg-gray-100 rounded w-3/5" />
        </div>
      </div>
    );
  }

  if (!transcript) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-drx-600" />
          <h3 className="font-semibold text-gray-900 text-sm">Speech Transcript</h3>
        </div>
        <div className="flex items-center gap-2">
          {language && (
            <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              <Globe className="w-3 h-3" />{languageLabels[language] || language}
            </span>
          )}
          <CheckCircle2 className="w-4 h-4 text-green-500" />
        </div>
      </div>
      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{transcript}</p>
      </div>
    </motion.div>
  );
}
