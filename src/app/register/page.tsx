"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Mic, ClipboardList } from "lucide-react";
import Link from "next/link";
import type { RegistrationMethod, DoctorRegistrationData } from "@/lib/types";
import { VoiceRegistration } from "@/components/voice";
import ManualRegistrationForm from "@/components/ManualRegistrationForm";

export default function RegisterPage() {
  const [method, setMethod] = useState<RegistrationMethod | null>(null);
  const [prefillData, setPrefillData] = useState<Partial<DoctorRegistrationData> | null>(null);
  const [finalJson, setFinalJson] = useState<DoctorRegistrationData | null>(null);

  const handleVoiceComplete = (data: Partial<DoctorRegistrationData>) => {
    setPrefillData(data);
    setMethod("manual"); // Switch to form with prefilled data
  };

  const handleFormSubmit = (data: DoctorRegistrationData) => {
    setFinalJson(data);
  };

  const handleReset = () => {
    setFinalJson(null);
    setMethod(null);
    setPrefillData(null);
  };

  // Final JSON output view
  if (finalJson) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl"
        >
          <div className="bg-white rounded-2xl shadow-xl border border-green-100 p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Registration Complete</h2>
              <p className="text-gray-500 mt-1">Doctor registration data (JSON output)</p>
            </div>

            <pre className="bg-gray-900 text-green-400 p-6 rounded-xl overflow-x-auto text-sm font-mono">
              {JSON.stringify(finalJson, null, 2)}
            </pre>

            <div className="flex gap-3 mt-6 justify-center">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(finalJson, null, 2));
                }}
                className="px-4 py-2 bg-drx-600 text-white rounded-lg hover:bg-drx-700 transition-colors text-sm font-medium"
              >
                Copy JSON
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                New Registration
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 md:py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href={method ? "#" : "/qr-register"}
            onClick={(e) => {
              if (method) {
                e.preventDefault();
                setMethod(null);
                setPrefillData(null);
              }
            }}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-drx-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {method ? "Back to Methods" : "Back"}
          </Link>
        </div>

        <AnimatePresence mode="wait">
          {/* Method Selection */}
          {!method && (
            <motion.div
              key="method-selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-xl mx-auto"
            >
              <div className="text-center mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  Choose Registration Method
                </h1>
                <p className="text-gray-500">
                  Select how you would like to register with DRX
                </p>
              </div>

              <div className="grid gap-4">
                {/* Voice Registration */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setMethod("voice")}
                  className="w-full p-6 bg-white rounded-2xl border-2 border-drx-100 hover:border-drx-300 shadow-sm hover:shadow-md transition-all text-left group"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-drx-500 to-drx-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Mic className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 mb-1">
                        AI Voice Registration
                      </h3>
                      <p className="text-sm text-gray-500">
                        Speak your details naturally. Our AI will transcribe and extract your information automatically.
                      </p>
                      <span className="inline-block mt-2 text-xs font-medium text-drx-600 bg-drx-50 px-2 py-1 rounded-full">
                        Recommended
                      </span>
                    </div>
                  </div>
                </motion.button>

                {/* Manual Registration */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setMethod("manual")}
                  className="w-full p-6 bg-white rounded-2xl border-2 border-gray-100 hover:border-drx-200 shadow-sm hover:shadow-md transition-all text-left group"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ClipboardList className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 mb-1">
                        Manual Registration
                      </h3>
                      <p className="text-sm text-gray-500">
                        Fill in the registration form manually with your details.
                      </p>
                    </div>
                  </div>
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Voice Registration Flow */}
          {method === "voice" && (
            <motion.div
              key="voice-registration"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <VoiceRegistration onComplete={handleVoiceComplete} />
            </motion.div>
          )}

          {/* Manual Registration Form */}
          {method === "manual" && (
            <motion.div
              key="manual-registration"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <ManualRegistrationForm
                prefillData={prefillData || undefined}
                onSubmit={handleFormSubmit}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
