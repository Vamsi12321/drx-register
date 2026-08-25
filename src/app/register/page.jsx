"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Zap, ShieldCheck, Star, User, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { VoiceRegistration } from "@/components/voice";
import ManualRegistrationForm from "@/components/ManualRegistrationForm";

export default function RegisterPage() {
  const [method, setMethod] = useState(null);
  const [prefillData, setPrefillData] = useState(null);
  const [finalJson, setFinalJson] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewData, setReviewData] = useState(null);
  const [otpScreen, setOtpScreen] = useState(false); // show OTP input
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState(null);
  const [otpSuccess, setOtpSuccess] = useState(null); // "OTP sent" message
  const [verifyingOtp, setVerifyingOtp] = useState(false);

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

  // Form submit → goes to review screen (no API call yet)
  const handleFormReview = (data) => {
    setReviewData(data);
  };

  // Confirm from review → calls Proxzar register, then shows OTP
  const handleConfirmSubmit = async () => {
    if (!reviewData) return;
    const data = reviewData;
    setIsSubmitting(true);
    setSubmitError(null);

    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

    try {
      // ── Step 1: Register with Proxzar (temporary, sends OTP) ──
      console.log(`[DOBO] Step 1: Registering OAuth user: ${data.username}`);

      const oauthPayload = {
        UserName: data.username,
        UserPassword: data.password,
        UserFullName: data.name,
        UserEmail: data.email,
        UserPhone: `+91${data.phone}`,
        DataSource: "DOBO",
        EmailVerified: false,
        PhoneVerified: false,
        CallbackUrl: "https://drx.proxzar.ai/dobo",
      };

      const oauthRes = await fetch(`${basePath}/api/auth/addUser`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(oauthPayload),
      });

      if (!oauthRes.ok) {
        const oauthErr = await oauthRes.json().catch(() => ({}));
        console.log(`[DOBO] Step 1: ✗ OAuth register failed (${oauthRes.status}):`, JSON.stringify(oauthErr));

        if (oauthErr.detail === "Error adding new user.") {
          setSubmitError("An account with this username or email already exists. Please try a different username.");
        } else if (oauthRes.status === 422) {
          setSubmitError("Invalid data. Please check your username and password format.");
        } else if (oauthRes.status === 503) {
          setSubmitError("Service temporarily unavailable. Please try again in a moment.");
        } else {
          setSubmitError("Unable to create your account. Please try again.");
        }
        setIsSubmitting(false);
        return;
      }

      console.log(`[DOBO] Step 1: ✓ OAuth registered, OTP sent to: ${data.email}`);

      // Show OTP screen
      setIsSubmitting(false);
      setOtpScreen(true);
      setOtpSuccess("OTP sent successfully to your email.");
      setOtpError(null);

    } catch (err) {
      console.error(`[DOBO] Registration error:`, err?.message || err);
      setSubmitError("Unable to connect to the server. Please check your internet connection and try again.");
      setIsSubmitting(false);
    }
  };

  // Verify OTP → then call DRX → then redirect
  const handleVerifyOtp = async () => {
    if (!otp.trim() || otp.length < 4) {
      setOtpError("Please enter a valid OTP.");
      return;
    }

    const data = reviewData;
    setVerifyingOtp(true);
    setOtpError(null);

    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

    try {
      // ── Step 2: Verify email OTP ──
      console.log(`[DOBO] Step 2: Verifying OTP for: ${data.email}`);

      const verifyRes = await fetch(`${basePath}/api/auth/verifyOTP`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ UserEmail: data.email, OTP: otp }),
      });

      if (!verifyRes.ok) {
        const verifyErr = await verifyRes.json().catch(() => ({}));
        console.log(`[DOBO] Step 2: ✗ OTP verification failed (${verifyRes.status}):`, JSON.stringify(verifyErr));

        if (verifyRes.status === 422) {
          setOtpError("Invalid OTP. Please check and try again.");
        } else {
          setOtpError(verifyErr.detail || "OTP verification failed. Please try again.");
        }
        setVerifyingOtp(false);
        return;
      }

      console.log(`[DOBO] Step 2: ✓ OTP verified for: ${data.email}`);

      // ── Step 3: Register with DRX backend ──
      console.log(`[DOBO] Step 3: Registering with DRX...`);

      // Build corrections
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

      const drxPayload = {
        doctor_name: data.name,
        email: data.email,
        phone: `+91${data.phone}`,
        hospital: data.hospital,
        specialization: data.department,
        username: data.username,
        password: data.password,
        source: source,
        location: {
          latitude: data.location?.latitude || "",
          longitude: data.location?.longitude || "",
          address: data.location?.address || "",
          city: data.location?.city || "",
          state: data.location?.state || "",
          country: data.location?.country || "",
        },
        transcript: voicePipelineData?.transcript || null,
        ner_output: voicePipelineData?.ner_output !== undefined ? voicePipelineData.ner_output : null,
        pipeline_output: voicePipelineData?.pipeline_output || null,
        auto_fill: voicePipelineData?.auto_fill || null,
        corrections: corrections,
      };

      const drxRes = await fetch(`${basePath}/api/onboarding/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(drxPayload),
      });

      const drxResult = await drxRes.json();

      if (drxRes.status === 409) {
        console.log(`[DOBO] Step 3: ✗ Duplicate doctor`);
        setOtpError("A doctor with this phone number or email is already registered.");
        setVerifyingOtp(false);
        return;
      }

      if (!drxRes.ok) {
        console.log(`[DOBO] Step 3: ✗ DRX failed (${drxRes.status}):`, JSON.stringify(drxResult));
        setOtpError("Registration could not be completed. Please try again.");
        setVerifyingOtp(false);
        return;
      }

      console.log(`[DOBO] Step 3: ✓ DRX registration complete (id: ${drxResult.onboarding_id || ""})`);

      // ── All done → show success then redirect ──
      setVerifyingOtp(false);
      setOtpScreen(false);
      setFinalJson(drxResult);

      // Redirect after 2 seconds
      setTimeout(() => {
        window.location.href = "https://drx.proxzar.ai/drx";
      }, 2500);

    } catch (err) {
      console.error(`[DOBO] Verification/Registration error:`, err?.message || err);
      setOtpError("Unable to connect to the server. Please check your internet connection.");
      setVerifyingOtp(false);
    }
  };

  const handleReset = () => { setFinalJson(null); setMethod(null); setPrefillData(null); setSource("MANUAL"); setSubmitError(null); setVoicePipelineData(null); setReviewData(null); setOtpScreen(false); setOtp(""); setOtpError(null); setOtpSuccess(null); };

  // ── OTP Verification Screen ──
  if (otpScreen && reviewData) {
    return (
      <div className="min-h-screen bg-[#eef1fb] flex items-center justify-center px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">

            {/* Header */}
            <div className="px-6 py-5 text-center border-b border-gray-100">
              <div className="inline-flex w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 items-center justify-center mb-3">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-lg font-black text-gray-900">Verify Your Email</h2>
              <p className="text-[11px] text-gray-400 mt-1">
                We&apos;ve sent a verification code to
              </p>
              <p className="text-[12px] font-semibold text-blue-600">{reviewData.email}</p>
            </div>

            {/* OTP Input */}
            <div className="px-6 py-5">
              <label className="block text-[11px] font-semibold text-gray-500 mb-2">Enter OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => { setOtp(e.target.value.replace(/[^0-9]/g, "").slice(0, 6)); setOtpError(null); setOtpSuccess(null); }}
                placeholder="Enter 6-digit code"
                maxLength={6}
                className="w-full px-4 py-3 text-center text-lg font-bold tracking-[0.3em] rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                autoFocus
              />

              {/* Success message */}
              {otpSuccess && (
                <div className="mt-3 p-2.5 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-[11px] text-green-600">{otpSuccess}</p>
                </div>
              )}

              {/* Error */}
              {otpError && (
                <div className="mt-3 p-2.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                  <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-[11px] text-red-600">{otpError}</p>
                </div>
              )}

              {/* Verify button */}
              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={verifyingOtp || otp.length < 4}
                className="w-full mt-4 py-3 rounded-xl text-white font-bold text-sm disabled:opacity-50 shadow-lg shadow-blue-200/50"
                style={{ background: "linear-gradient(135deg,#3b82f6,#6366f1)" }}
              >
                {verifyingOtp ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Verifying...
                  </span>
                ) : "Verify & Complete Registration"}
              </button>

              {/* Resend */}
              <div className="mt-4 text-center">
                <p className="text-[10px] text-gray-400">
                  Didn&apos;t receive the code?{" "}
                  <button type="button" onClick={() => { setOtpSuccess(null); setOtpError(null); setOtp(""); handleConfirmSubmit(); }}
                    className="text-blue-600 font-semibold hover:underline">
                    Resend OTP
                  </button>
                </p>
              </div>

              {/* Back to edit */}
              <div className="mt-4 pt-3 border-t border-gray-100 text-center">
                <button type="button"
                  onClick={() => { setOtpScreen(false); setOtp(""); setOtpError(null); setOtpSuccess(null); }}
                  className="text-[11px] text-gray-500 font-semibold hover:text-blue-600 transition-colors">
                  ← Back to edit details
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Review & Confirm Screen ──
  if (reviewData && !finalJson) {
    return (
      <div className="min-h-screen bg-[#eef1fb] px-4 py-8">
        <div className="max-w-xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">

            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 bg-blue-50/50">
              <h2 className="text-lg font-black text-gray-900">Review Your Details</h2>
              <p className="text-[11px] text-gray-400 mt-0.5">Please confirm your information before registering</p>
            </div>

            {/* Details */}
            <div className="px-6 py-4 space-y-3">
              <ReviewRow label="Full Name" value={reviewData.name} />
              <ReviewRow label="Email" value={reviewData.email} />
              <ReviewRow label="Phone" value={reviewData.phone} />
              <ReviewRow label="Hospital / Clinic" value={reviewData.hospital} />
              <ReviewRow label="Specialization" value={reviewData.department} />
              <ReviewRow label="Username" value={reviewData.username} />
              <ReviewRow label="Password" value="••••••••" />
              {reviewData.location?.city && (
                <ReviewRow label="Practice Location"
                  value={[reviewData.location.address, reviewData.location.city, reviewData.location.state, reviewData.location.country].filter(Boolean).join(", ")} />
              )}
              <ReviewRow label="Registration Source" value={source} />
            </div>

            {/* Error */}
            {submitError && (
              <div className="mx-6 mb-3 p-3 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-[12px] font-bold text-red-700">Registration Error</p>
                  <p className="text-[11px] text-red-600 mt-0.5">{submitError}</p>
                </div>
                <button type="button" onClick={() => setSubmitError(null)} className="text-red-300 hover:text-red-500 flex-shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {/* Actions */}
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button type="button" onClick={() => { setPrefillData(reviewData); setReviewData(null); setSubmitError(null); }}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                ← Edit
              </button>
              <button type="button" onClick={handleConfirmSubmit} disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl text-white font-bold text-sm shadow-lg disabled:opacity-50"
                style={{ background: "linear-gradient(135deg,#3b82f6,#6366f1)" }}>
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Registering...
                  </span>
                ) : "Confirm & Register"}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ── Final JSON ──
  if (finalJson) {
    return (
      <div className="min-h-screen bg-[#eef1fb] flex items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-sm text-center"
        >
          {/* Animated checkmark */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 12 }}
            className="mx-auto w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6"
          >
            <motion.svg
              className="w-10 h-10 text-green-500"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}
            >
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"
              />
            </motion.svg>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-2xl font-black text-gray-900 mb-2"
          >
            Registration Successful!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-sm text-gray-500 mb-6"
          >
            Redirecting to your DRX portal...
          </motion.p>

          {/* Loading dots animation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="flex items-center justify-center gap-1.5"
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-blue-500"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
              />
            ))}
          </motion.div>
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
        <ManualRegistrationForm prefillData={prefillData || undefined} onSubmit={handleFormReview} submitError={submitError} isSubmitting={isSubmitting} />
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
              <img src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/images/notepad.png`} alt="Manual Registration" width={80} height={90}
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

function ReviewRow({ label, value }) {
  return (
    <div className="flex items-start justify-between py-2 border-b border-gray-50 last:border-b-0">
      <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide w-32 flex-shrink-0">{label}</span>
      <span className="text-[12px] text-gray-800 font-medium text-right flex-1 break-words">{value || "—"}</span>
    </div>
  );
}
