"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Zap, ShieldCheck, Star, User, Lock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { VoiceRegistration } from "@/components/voice";
import ManualRegistrationForm from "@/components/ManualRegistrationForm";

export default function RegisterPage() {
  const [method, setMethod] = useState(null);
  const [prefillData, setPrefillData] = useState(null);
  const [finalJson, setFinalJson] = useState(null);

  const handleVoiceComplete = (data) => { setPrefillData(data); setMethod("manual"); };
  const handleFormSubmit = (data) => setFinalJson(data);
  const handleReset = () => { setFinalJson(null); setMethod(null); setPrefillData(null); };

  // ── Final JSON ──
  if (finalJson) {
    return (
      <div className="min-h-screen bg-[#eef1fb] flex items-center justify-center px-4 py-8">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-2xl">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-100 mb-3">
                <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Registration Complete</h2>
            </div>
            <pre className="bg-gray-900 text-green-400 p-5 rounded-xl overflow-auto text-xs font-mono max-h-64">
              {JSON.stringify(finalJson, null, 2)}
            </pre>
            <div className="flex gap-3 mt-5 justify-center">
              <button onClick={() => navigator.clipboard.writeText(JSON.stringify(finalJson, null, 2))}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">Copy JSON</button>
              <button onClick={handleReset}
                className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">New Registration</button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Voice flow ──
  if (method === "voice") {
    return (
      <div className="min-h-screen bg-[#eef1fb] flex flex-col">
        <div className="flex-shrink-0 px-8 pt-6 pb-2">
          <button onClick={() => setMethod(null)}
            className="flex items-center gap-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-full px-4 py-2 shadow-sm hover:border-blue-300 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>
        <VoiceRegistration onComplete={handleVoiceComplete} />
      </div>
    );
  }

  // ── Manual flow ──
  if (method === "manual") {
    return (
      <div className="h-screen overflow-hidden">
        <div className="absolute top-4 left-4 z-50">
          <button onClick={() => { setMethod(null); setPrefillData(null); }}
            className="flex items-center gap-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-full px-4 py-2 shadow-sm hover:border-blue-300 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>
        <ManualRegistrationForm prefillData={prefillData || undefined} onSubmit={handleFormSubmit} />
      </div>
    );
  }

  // ── Method Selection ──
  return (
    <div className="h-screen bg-[#eef1fb] flex flex-col overflow-hidden select-none">

      {/* Back */}
      <div className="flex-shrink-0 px-10 pt-6">
        <Link href="/qr-register">
          <button className="flex items-center gap-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-full px-4 py-2 shadow-sm hover:border-blue-300 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </Link>
      </div>

      {/* Center content */}
      <div className="flex-1 flex flex-col items-center justify-center gap-5 px-4 pb-8 overflow-hidden">

        {/* Stethoscope circle */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-16 h-16 rounded-full bg-white border border-blue-100 shadow-lg flex items-center justify-center"
        >
          {/* Standard medical stethoscope SVG */}
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none"
            stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 3a1 1 0 0 0-1 1v5a5 5 0 0 0 5 5 5 5 0 0 0 5-5V4a1 1 0 0 0-1-1"/>
            <path d="M8 3v3m4-3v3"/>
            <path d="M10 14v2a4 4 0 0 0 4 4h0a4 4 0 0 0 4-4v-3"/>
            <circle cx="18" cy="13" r="1.5" fill="#3b82f6" stroke="none"/>
          </svg>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-6">
            <div className="grid grid-cols-3 gap-1.5">
              {[...Array(9)].map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-300/50" />)}
            </div>
            <h1 className="text-3xl font-black text-gray-900">Choose Registration Method</h1>
            <div className="grid grid-cols-3 gap-1.5">
              {[...Array(9)].map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-300/50" />)}
            </div>
          </div>
          <p className="text-sm text-gray-400 mt-2">Select how you would like to register with DRX</p>
        </motion.div>

        {/* ── Two equal-height cards ── */}
        <div className="w-full max-w-[680px] flex flex-col gap-3">

          {/* AI Voice Card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            onClick={() => setMethod("voice")}
            className="flex rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all border border-blue-100 h-[130px]"
          >
            {/* Blue left — animated waveform + mic SVG */}
            <div className="w-40 flex-shrink-0 bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center gap-[3px]">
                {[5,9,15,22,13,19,10,15,22,13,9,5].map((h, i) => (
                  <motion.div key={i} className="w-[3px] bg-white/40 rounded-full"
                    animate={{ height: [`${h}px`, `${Math.min(h*2,26)}px`, `${h}px`] }}
                    transition={{ duration: 1.1, repeat: Infinity, delay: i*0.09, ease:"easeInOut" }} />
                ))}
              </div>
              <div className="relative z-10 w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center shadow-md">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none"
                    stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="2" width="6" height="11" rx="3"/>
                    <path d="M5 10a7 7 0 0 0 14 0"/>
                    <line x1="12" y1="19" x2="12" y2="22"/>
                    <line x1="8" y1="22" x2="16" y2="22"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Right */}
            <div className="flex-1 bg-white px-5 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full mb-1.5">
                  <Star className="w-2.5 h-2.5 fill-blue-500" /> Recommended
                </div>
                <h3 className="text-[15px] font-black text-gray-900 mb-1">AI Voice Registration</h3>
                <p className="text-[12px] text-gray-400 leading-snug mb-2">
                  Speak your details naturally. Our AI will transcribe and extract your information automatically.
                </p>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1 text-[11px] text-gray-400"><Zap className="w-3 h-3 text-blue-400"/>Fast &amp; Easy</span>
                  <span className="flex items-center gap-1 text-[11px] text-gray-400"><Zap className="w-3 h-3 text-blue-400"/>AI Powered</span>
                  <span className="flex items-center gap-1 text-[11px] text-gray-400"><ShieldCheck className="w-3 h-3 text-blue-400"/>Secure &amp; Private</span>
                </div>
              </div>
              <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                <ArrowRight className="w-4 h-4 text-white" />
              </div>
            </div>
          </motion.div>

          {/* Manual Card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.16 }}
            onClick={() => setMethod("manual")}
            className="flex rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all border border-gray-100 h-[130px]"
          >
            {/* Light left — notepad image */}
            <div className="w-40 flex-shrink-0 bg-[#eef2ff] flex items-center justify-center relative overflow-hidden">
              <div className="absolute w-20 h-20 rounded-full bg-blue-200/40 -bottom-8 -left-8" />
              <Image src="/images/notepad.png" alt="Manual Registration" width={100} height={110}
                className="relative z-10 object-contain mix-blend-multiply" />
            </div>

            {/* Right */}
            <div className="flex-1 bg-white px-5 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-[15px] font-black text-gray-900 mb-1">Manual Registration</h3>
                <p className="text-[12px] text-gray-400 leading-snug mb-2">
                  Fill in the registration form manually with your details.
                </p>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1 text-[11px] text-gray-400"><User className="w-3 h-3 text-gray-400"/>Complete Control</span>
                  <span className="flex items-center gap-1 text-[11px] text-gray-400"><Zap className="w-3 h-3 text-gray-400"/>Step by Step</span>
                  <span className="flex items-center gap-1 text-[11px] text-gray-400"><Lock className="w-3 h-3 text-gray-400"/>100% Secure</span>
                </div>
              </div>
              <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <ArrowRight className="w-4 h-4 text-gray-500" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Safety note */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.28 }}
          className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          <p className="text-xs text-gray-400">Your information is safe with us. We never share your data.</p>
        </motion.div>
      </div>

      {/* Plus decorations */}
      <span className="fixed left-6 top-1/2 text-blue-200/60 text-2xl pointer-events-none">+</span>
      <span className="fixed right-6 top-1/3 text-blue-200/60 text-2xl pointer-events-none">+</span>

      {/* Bottom-left decorative bubbles */}
      <div className="fixed bottom-0 left-0 pointer-events-none">
        <div className="absolute w-48 h-48 rounded-full bg-blue-200/30" style={{ bottom: -60, left: -60 }} />
        <div className="absolute w-28 h-28 rounded-full bg-indigo-200/40" style={{ bottom: 10, left: 40 }} />
        <div className="absolute w-16 h-16 rounded-full bg-blue-300/30" style={{ bottom: 60, left: 10 }} />
      </div>
    </div>
  );
}
