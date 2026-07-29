"use client";

import { motion } from "framer-motion";
import { Brain, User, Mail, Phone, Building2, Stethoscope, CheckCircle2, XCircle } from "lucide-react";
import type { ExtractResponse } from "@/lib/voiceApi";

interface DetectedFieldsCardProps {
  data: ExtractResponse;
  confidence?: number;
}

export default function DetectedFieldsCard({ data, confidence }: DetectedFieldsCardProps) {
  const fields = [
    { key: "name", label: "Doctor Name", icon: User, value: data.name },
    { key: "email", label: "Email", icon: Mail, value: data.email },
    { key: "phone", label: "Phone", icon: Phone, value: data.phone },
    { key: "hospital", label: "Hospital / Clinic", icon: Building2, value: data.hospital },
    { key: "department", label: "Department", icon: Stethoscope, value: data.department },
  ];

  const filledCount = fields.filter((f) => f.value).length;
  const confidencePercent = confidence != null ? Math.round(confidence * 100) : Math.round((filledCount / 5) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-drx-600" />
          <h3 className="font-semibold text-gray-900 text-sm">Detected Information</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{filledCount}/5 fields</span>
          {/* Confidence badge */}
          <div
            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              confidencePercent >= 80
                ? "bg-green-100 text-green-700"
                : confidencePercent >= 50
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {confidencePercent}%
          </div>
        </div>
      </div>

      {/* Fields */}
      <div className="space-y-2">
        {fields.map((field, index) => {
          const hasValue = !!field.value;
          const Icon = field.icon;

          return (
            <motion.div
              key={field.key}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * index }}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                hasValue
                  ? "bg-green-50 border border-green-100"
                  : "bg-gray-50 border border-gray-100"
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${hasValue ? "text-green-600" : "text-gray-400"}`} />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500">{field.label}</p>
                <p className={`text-sm font-medium truncate ${hasValue ? "text-gray-900" : "text-gray-400 italic"}`}>
                  {field.value || "Not detected"}
                </p>
              </div>
              {hasValue ? (
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-gray-300 flex-shrink-0" />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Footer note */}
      <p className="mt-3 text-xs text-gray-400 text-center">
        You can edit all fields in the form below
      </p>
    </motion.div>
  );
}
