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
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Track registration source
  const [source, setSource] = useState("MANUAL");

  // Voice pipeline data — stored when voice extraction completes
  const [voicePipelineData, setVoicePipelineData] = useState(null);

  const handleVoiceComplete = (data) => {
    // data contains: { name, email, phone, hospital, department, _transcript, _entities, _pipelineData, _pipelineSteps, _confidence }
    setPrefillData(data);
    setSource("VOICE");

    // Store pipeline data for registration
    setVoicePipelineData({
      transcript: data._transcript || null,
      ner_output: data._entities || null,
      pipeline_output: data._pipelineData || null,
      auto_fill: {
        doctor_name: data.name || null,
        hospital: data.hospital || null,
        specialization: data.department || null,
        phone: data.phone || null,
        email: data.email || null,
      },
    });

    setMethod("manual");
  };

  const handleFormSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitError(null);

    // Build corrections (compare auto_fill with final form values)
    let corrections = null;
    if (source === "VOICE" && voicePipelineData?.auto_fill) {
      const af = voicePipelineData.auto_fill;
      const c = {};
      if (af.doctor_name && af.doctor_name !== data.name) c.doctor_name = { from: af.doctor_name, to: data.name };
      if (af.hospital && af.hospital !== data.hospital) c.hospital = { from: af.hospital, to: data.hospital };
      if (af.specialization && af.specialization !== data.department) c.specialization = { from: af.specialization, to: data.department };
      if (af.phone && af.phone !== data.phone) c.phone = { from: af.phone, to: data.phone };
      if (af.email && af.email !== data.email) c.email = { from: af.email, to: data.email };
      if (Object.keys(c).length > 0) corrections = c;
    }

    // Map form data to backend API schema
    const payload = {
      doctor_name: data.name,
      email: data.email,
      phone: data.phone,
      hospital: data.hospital,
      specialization: data.department,
      source: source,
      location: {
        latitude: data.location?.latitude || "",
        longitude: data.location?.longitude || "",
        address: data.location?.address || "",
        city: data.location?.city || "",
        state: data.location?.state || "",
        country: data.location?.country || "",
      },
      // Voice pipeline fields (null for MANUAL)
      transcript: voicePipelineData?.transcript || null,
      ner_output: voicePipelineData?.ner_output !== undefined ? voicePipelineData.ner_output : null,
      pipeline_output: voicePipelineData?.pipeline_output || null,
      auto_fill: voicePipelineData?.auto_fill || null,
      corrections: corrections,
    };

    try {
      const response = await fetch("/api/onboarding/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.status === 409) {
        setSubmitError("A doctor with this phone or email is already registered.");
        setIsSubmitting(false);
        return;
      }

      if (!response.ok) {
        setSubmitError(result.detail || "Registration failed. Please try again.");
        setIsSubmitting(false);
        return;
      }

      // Success — show result
      setFinalJson(result);
    } catch (err) {
      setSubmitError("Could not reach server. Please check your connection.");
    }

    setIsSubmitting(false);
  };

  const handleReset = () => { setFinalJson(null); setMethod(null); setPrefillData(null); setSource("MANUAL"); setSubmitError(null); setVoicePipelineData(null); };

  // ── Final JSON ──
  if (finalJson) {
    return (
      <div className="min-h-screen bg-[#eef1fb] flex items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md text-center"
        >
          {/* Animated checkmark */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 12 }}
            className="mx-auto w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6"
          >
            <motion.svg
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
              className="w-10 h-10 text-green-500"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}
            >
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"
              />
            </motion.svg>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-2xl font-black text-gray-900 mb-2"
          >
            Registration Successful!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-sm text-gray-400 mb-6"
          >
            Welcome to DRX, <span className="font-semibold text-gray-700">{finalJson.doctor_name || "Doctor"}</span>
          </motion.p>

          {/* Info card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6 text-left"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 3a1 1 0 0 0-1 1v5a5 5 0 0 0 10 0V4a1 1 0 0 0-1-1"/>
                  <path d="M8 3v3m4-3v3"/>
                  <path d="M10 14v2a4 4 0 0 0 8 0v-3"/>
                  <circle cx="18" cy="13" r="1.5" fill="#3b82f6" stroke="none"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{finalJson.doctor_name || "Doctor"}</p>
                <p className="text-[10px] text-gray-400">{finalJson.specialization || ""} • {finalJson.hospital || ""}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-[11px]">
              <div>
                <p className="text-gray-400 font-medium">Status</p>
                <p className="font-bold text-green-600">{finalJson.status || "ACTIVE"}</p>
              </div>
              <div>
                <p className="text-gray-400 font-medium">Source</p>
                <p className="font-bold text-blue-600">{finalJson.source || source}</p>
              </div>
              <div>
                <p className="text-gray-400 font-medium">Phone</p>
                <p className="font-semibold text-gray-700">{finalJson.phone || ""}</p>
              </div>
              <div>
                <p className="text-gray-400 font-medium">Email</p>
                <p className="font-semibold text-gray-700 truncate">{finalJson.email || ""}</p>
              </div>
            </div>
          </motion.div>

          {/* CTA button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <button onClick={handleReset}
              className="w-full py-3 rounded-2xl text-white font-bold text-sm shadow-lg shadow-blue-200/50"
              style={{ background: "linear-gradient(135deg,#3b82f6,#6366f1)" }}>
              Register Another Doctor
            </button>
          </motion.div>

          {/* Confetti-like dots animation */}
          <div className="relative h-8 mt-4 overflow-hidden">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  left: `${8 + i * 8}%`,
                  background: ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"][i % 4],
                }}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: [30, -10, 30], opacity: [0, 1, 0] }}
                transition={{ delay: 0.8 + i * 0.08, duration: 1.2, ease: "easeOut" }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Voice flow ──
  if (method === "voice") {
    return (
      <div className="min-h-screen bg-[#eef1fb] flex flex-col">
        <div className="flex-shrink-0 px-4 md:px-8 pt-4 md:pt-6 pb-2">
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
      <div className="min-h-screen md:h-screen md:overflow-hidden relative">
        <div className="absolute top-3 left-3 md:top-4 md:left-4 z-50">
          <button onClick={() => { setMethod(null); setPrefillData(null); }}
            className="flex items-center gap-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-full px-3 md:px-4 py-2 shadow-sm hover:border-blue-300 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>
        <ManualRegistrationForm prefillData={prefillData || undefined} onSubmit={handleFormSubmit} submitError={submitError} isSubmitting={isSubmitting} />
      </div>
    );
  }

  // ── Method Selection ──
  return (
    <div className="min-h-screen md:h-screen bg-[#eef1fb] flex flex-col md:overflow-hidden select-none">
      <div className="flex-shrink-0 px-4 md:px-10 pt-3 md:pt-6">
        <Link href="/qr-register">
          <button className="flex items-center gap-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-full px-4 py-2 shadow-sm hover:border-blue-300 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </Link>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-3 md:gap-5 px-4 py-4 md:pb-8">

        {/* Stethoscope */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white border border-blue-100 shadow-lg flex items-center justify-center">
          <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 3a1 1 0 0 0-1 1v5a5 5 0 0 0 5 5 5 5 0 0 0 5-5V4a1 1 0 0 0-1-1"/>
            <path d="M8 3v3m4-3v3"/>
            <path d="M10 14v2a4 4 0 0 0 4 4h0a4 4 0 0 0 4-4v-3"/>
            <circle cx="18" cy="13" r="1.5" fill="#3b82f6" stroke="none"/>
          </svg>
        </motion.div>

        {/* Title */}
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="text-center">
          <div className="flex items-center justify-center gap-3 md:gap-6">
            <div className="hidden sm:grid grid-cols-3 gap-1.5">
              {[...Array(9)].map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-300/50" />)}
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900">Choose Registration Method</h1>
            <div className="hidden sm:grid grid-cols-3 gap-1.5">
              {[...Array(9)].map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-300/50" />)}
            </div>
          </div>
          <p className="text-xs md:text-sm text-gray-400 mt-1 md:mt-2">Select how you would like to register with DRX</p>
        </motion.div>

        {/* Cards */}
        <div className="w-full max-w-sm sm:max-w-lg md:max-w-[680px] flex flex-col gap-3">

          {/* AI Voice Card */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            onClick={() => setMethod("voice")}
            className="flex rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all border border-blue-100 h-[100px] md:h-[130px]">
            <div className="w-28 md:w-40 flex-shrink-0 bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center gap-[3px]">
                {[5,9,15,22,13,19,10,15,22,13,9,5].map((h, i) => (
                  <motion.div key={i} className="w-[3px] bg-white/40 rounded-full"
                    animate={{ height: [`${h}px`, `${Math.min(h*2,26)}px`, `${h}px`] }}
                    transition={{ duration: 1.1, repeat: Infinity, delay: i*0.09, ease:"easeInOut" }} />
                ))}
              </div>
              <div className="relative z-10 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/20 flex items-center justify-center">
                <div className="w-9 h-9 md:w-11 md:h-11 rounded-full bg-white flex items-center justify-center shadow-md">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="2" width="6" height="11" rx="3"/>
                    <path d="M5 10a7 7 0 0 0 14 0"/>
                    <line x1="12" y1="19" x2="12" y2="22"/>
                    <line x1="8" y1="22" x2="16" y2="22"/>
                  </svg>
                </div>
              </div>
            </div>
            <div className="flex-1 bg-white px-3 md:px-5 flex items-center gap-2 md:gap-3">
              <div className="flex-1 min-w-0">
                <div className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 text-[9px] md:text-[10px] font-bold px-2 py-0.5 rounded-full mb-1">
                  <Star className="w-2 h-2 md:w-2.5 md:h-2.5 fill-blue-500" /> Recommended
                </div>
                <h3 className="text-sm md:text-[15px] font-black text-gray-900 mb-0.5 md:mb-1">AI Voice Registration</h3>
                <p className="text-[10px] md:text-[12px] text-gray-400 leading-snug mb-1 md:mb-2 line-clamp-2">
                  Speak naturally. Our AI will transcribe and extract your information.
                </p>
                <div className="hidden sm:flex items-center gap-2 md:gap-4">
                  <span className="flex items-center gap-1 text-[10px] md:text-[11px] text-gray-400"><Zap className="w-2.5 h-2.5 md:w-3 md:h-3 text-blue-400"/>Fast &amp; Easy</span>
                  <span className="flex items-center gap-1 text-[10px] md:text-[11px] text-gray-400"><ShieldCheck className="w-2.5 h-2.5 md:w-3 md:h-3 text-blue-400"/>Secure</span>
                </div>
              </div>
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
              </div>
            </div>
          </motion.div>

          {/* Manual Card */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
            onClick={() => setMethod("manual")}
            className="flex rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all border border-gray-100 h-[100px] md:h-[130px]">
            <div className="w-28 md:w-40 flex-shrink-0 bg-[#eef2ff] flex items-center justify-center relative overflow-hidden">
              <div className="absolute w-20 h-20 rounded-full bg-blue-200/40 -bottom-8 -left-8" />
              <Image src="/images/notepad.png" alt="Manual Registration" width={80} height={90}
                className="relative z-10 object-contain mix-blend-multiply md:w-[100px] md:h-[110px]" />
            </div>
            <div className="flex-1 bg-white px-3 md:px-5 flex items-center gap-2 md:gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm md:text-[15px] font-black text-gray-900 mb-0.5 md:mb-1">Manual Registration</h3>
                <p className="text-[10px] md:text-[12px] text-gray-400 leading-snug mb-1 md:mb-2 line-clamp-2">
                  Fill in the registration form manually with your details.
                </p>
                <div className="hidden sm:flex items-center gap-2 md:gap-4">
                  <span className="flex items-center gap-1 text-[10px] md:text-[11px] text-gray-400"><User className="w-2.5 h-2.5 md:w-3 md:h-3 text-gray-400"/>Complete Control</span>
                  <span className="flex items-center gap-1 text-[10px] md:text-[11px] text-gray-400"><Lock className="w-2.5 h-2.5 md:w-3 md:h-3 text-gray-400"/>100% Secure</span>
                </div>
              </div>
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-500" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Safety note */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.28 }}
          className="flex items-center gap-1.5">
          <ShieldCheck className="w-3 h-3 md:w-3.5 md:h-3.5 text-blue-400" />
          <p className="text-[10px] md:text-xs text-gray-400">Your information is safe with us. We never share your data.</p>
        </motion.div>
      </div>

      <span className="fixed left-4 md:left-6 top-1/2 text-blue-200/60 text-2xl pointer-events-none hidden md:block">+</span>
      <span className="fixed right-4 md:right-6 top-1/3 text-blue-200/60 text-2xl pointer-events-none hidden md:block">+</span>
      <div className="fixed bottom-0 left-0 pointer-events-none hidden sm:block">
        <div className="absolute w-48 h-48 rounded-full bg-blue-200/30" style={{ bottom: -60, left: -60 }} />
        <div className="absolute w-28 h-28 rounded-full bg-indigo-200/40" style={{ bottom: 10, left: 40 }} />
      </div>
    </div>
  );
}
