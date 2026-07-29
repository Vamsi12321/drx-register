"use client";

import { motion } from "framer-motion";
import { Brain, User, Mail, Phone, Building2, Stethoscope } from "lucide-react";
import type { DoctorRegistrationData } from "@/lib/types";

interface DetectedFieldsProps {
  data: Partial<DoctorRegistrationData>;
  confidence?: number;
  entities?: Record<string, string | null>;
}

export default function DetectedFields({ data, confidence = 0, entities }: DetectedFieldsProps) {
  const fields = [
    { key: "name", label: "Full Name", icon: User, value: data.name },
    { key: "email", label: "Email", icon: Mail, value: data.email },
    { key: "phone", label: "Phone", icon: Phone, value: data.phone },
    { key: "hospital", label: "Hospital", icon: Building2, value: data.hospital },
    { key: "department", label: "Department", icon: Stethoscope, value: data.department },
  ];

  const filledCount = fields.filter((f) => f.value).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-drx-600" />
          <h3 className="font-semibold text-gray-900 text-sm">AI Detected Fields</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{filledCount}/5 detected</span>
          <div
            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              confidence >= 0.8
                ? "bg-green-100 text-green-700"
                : confidence >= 0.5
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {Math.round(confidence * 100)}% confidence
          </div>
        </div>
      </div>

      {/* Fields */}
      <div className="space-y-2">
        {fields.map((field, index) => (
          <motion.div
            key={field.key}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex items-center gap-3 p-2 rounded-lg ${
              field.value ? "bg-green-50 border border-green-100" : "bg-gray-50 border border-gray-100"
            }`}
          >
            <field.icon className={`w-4 h-4 ${field.value ? "text-green-600" : "text-gray-400"}`} />
            <span className="text-xs text-gray-500 w-20">{field.label}</span>
            <span className={`text-sm font-medium flex-1 ${field.value ? "text-gray-900" : "text-gray-400"}`}>
              {field.value || "Not detected"}
            </span>
          </motion.div>
        ))}
      </div>

      {/* NER Entities */}
      {entities && Object.keys(entities).length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-400 mb-1">NER Entities</p>
          <div className="flex flex-wrap gap-1">
            {Object.entries(entities).map(([key, value]) =>
              value ? (
                <span
                  key={key}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-drx-50 text-drx-700 border border-drx-100"
                >
                  {key}: {value}
                </span>
              ) : null
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
