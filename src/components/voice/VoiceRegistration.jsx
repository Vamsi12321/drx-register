"use client";

import { useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight, RefreshCw, ShieldCheck, Mic, Square, Play, Pause, Upload } from "lucide-react";
import Toast from "./Toast";
import TranscriptCard from "./TranscriptCard";
import DetectedFieldsCard from "./DetectedFieldsCard";
import VoiceProcessingLoader from "./VoiceProcessingLoader";
import { voiceApi, VoiceServiceError } from "@/lib/voiceApi";

// stages: idle | recording | stopped | transcribing | extracting | complete | error

export default function VoiceRegistration({ onComplete }) {
  const [stage, setStage] = useState("idle");
  const [transcript, setTranscript] = useState("");
  const [language, setLanguage] = useState(undefined);
  const [extractedData, setExtractedData] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioBlobRef = useRef(null);
  const audioRef = useRef(null);
  const streamRef = useRef(null);

  const addToast = useCallback((type, title, message) => {
    setToasts((prev) => [...prev, { id: Date.now().toString(), type, title, message }]);
  }, []);
  const dismissToast = useCallback((id) => setToasts((p) => p.filter((t) => t.id !== id)), []);

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" : "audio/webm";
      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: mimeType });
        audioBlobRef.current = blob;
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setStage("stopped");
      };

      recorder.start(250);
      setStage("recording");
      setDuration(0);
      timerRef.current = setInterval(() => setDuration((p) => p + 1), 1000);
    } catch (err) {
      if (err.name === "NotAllowedError") addToast("error", "Permission Denied", "Please allow microphone access.");
      else addToast("error", "Microphone Error", "Could not access microphone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    }
  };

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
    else { audioRef.current.play(); setIsPlaying(true); }
  };

  const handleReRecord = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null); setStage("idle"); setDuration(0);
    audioBlobRef.current = null; setIsPlaying(false);
  };

  const handleProcess = async () => {
    if (!audioBlobRef.current) return;
    setStage("transcribing");
    setTranscript(""); setExtractedData(null);
    try {
      const transcription = await voiceApi.transcribe(audioBlobRef.current);
      if (!transcription.transcript?.trim()) {
        addToast("error", "No speech detected", "Please speak clearly and try again.");
        setStage("stopped"); return;
      }
      setTranscript(transcription.transcript);
      setLanguage(transcription.language);
      setStage("extracting");
      const extracted = await voiceApi.extract(transcription.transcript);
      setExtractedData(extracted);
      setStage("complete");
      const filled = Object.values(extracted).filter(Boolean).length;
      if (filled >= 4) addToast("success", "Details extracted", `${filled}/5 fields detected.`);
      else addToast("info", "Partial detection", `${filled}/5 fields. Fill the rest manually.`);
    } catch (err) {
      setStage("error");
      if (err instanceof VoiceServiceError) addToast("error", err.status === 503 ? "Service Unavailable" : "Failed", err.message);
      else addToast("error", "Error", err?.message || "Something went wrong.");
    }
  };

  const handleReset = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setStage("idle"); setTranscript(""); setLanguage(undefined);
    setExtractedData(null); setDuration(0); setAudioUrl(null); setIsPlaying(false);
  };

  const isRecording = stage === "recording";
  const isStopped = stage === "stopped";
  const isProcessing = stage === "transcribing" || stage === "extracting";
  const isIdle = stage === "idle" || stage === "error";
  const showMic = isIdle || isRecording;

  return (
    <div className="flex-1 bg-[#eef1fb] flex flex-col relative">
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* Decorative bubbles */}
      <div className="fixed bottom-0 left-0 pointer-events-none z-0">
        <div className="absolute w-48 h-48 rounded-full bg-blue-200/30" style={{ bottom: -60, left: -60 }} />
        <div className="absolute w-28 h-28 rounded-full bg-indigo-200/40" style={{ bottom: 10, left: 40 }} />
        <div className="absolute w-16 h-16 rounded-full bg-blue-300/30" style={{ bottom: 60, left: 10 }} />
      </div>
      <div className="fixed top-0 right-0 pointer-events-none z-0">
        <div className="absolute w-40 h-40 rounded-full bg-blue-100/40" style={{ top: -40, right: -40 }} />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center pt-2 pb-10 px-4">

        {/* Stethoscope */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="w-16 h-16 rounded-full bg-white border border-blue-100 shadow-lg flex items-center justify-center mb-5 flex-shrink-0">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none"
            stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 3a1 1 0 0 0-1 1v5a5 5 0 0 0 5 5 5 5 0 0 0 5-5V4a1 1 0 0 0-1-1"/>
            <path d="M8 3v3m4-3v3"/>
            <path d="M10 14v2a4 4 0 0 0 4 4h0a4 4 0 0 0 4-4v-3"/>
            <circle cx="18" cy="13" r="1.5" fill="#3b82f6" stroke="none"/>
          </svg>
        </motion.div>

        {/* Title */}
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="text-center mb-6 flex-shrink-0">
          <div className="flex items-center justify-center gap-6 mb-1">
            <div className="grid grid-cols-3 gap-1.5">
              {[...Array(9)].map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-300/50" />)}
            </div>
            <h1 className="text-[28px] font-black text-gray-900">AI Voice Registration</h1>
            <div className="grid grid-cols-3 gap-1.5">
              {[...Array(9)].map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-300/50" />)}
            </div>
          </div>
          <p className="text-sm text-gray-400">Speak your details in English, Hindi, or Telugu. AI will handle the rest.</p>
        </motion.div>

        {/* ── MIC + WAVEFORM (idle/recording) ── */}
        {showMic && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            className="flex items-center justify-center gap-2 mb-4 flex-shrink-0 w-full max-w-2xl px-4">
            {/* Left waveform */}
            <div className="flex items-center gap-[4px] flex-1 justify-end">
              {[10,16,26,38,28,44,32,48,36,42,28,34,20,14,8].map((h, i) => (
                <motion.div key={i} className="w-[3px] rounded-full flex-shrink-0"
                  style={{ background: isRecording ? "#3b82f6" : "#cbd5e1" }}
                  animate={{ height: isRecording ? [`${h}px`, `${Math.min(h*1.8,70)}px`, `${h}px`] : [`${h*0.6}px`, `${h}px`, `${h*0.6}px`] }}
                  transition={{ duration: isRecording ? 0.65 : 2.2, repeat: Infinity, delay: (14-i)*0.05, ease:"easeInOut" }} />
              ))}
            </div>
            {/* Mic */}
            <div className="relative flex-shrink-0 mx-4">
              <div className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)", transform: "scale(1.8)" }} />
              {isRecording && (
                <>
                  <motion.div className="absolute inset-0 rounded-full bg-blue-400/25" animate={{ scale: [1,1.6], opacity: [0.5,0] }} transition={{ duration: 1.4, repeat: Infinity }} />
                  <motion.div className="absolute inset-0 rounded-full bg-blue-400/15" animate={{ scale: [1,2], opacity: [0.4,0] }} transition={{ duration: 1.4, repeat: Infinity, delay: 0.5 }} />
                </>
              )}
              <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                onClick={isRecording ? stopRecording : startRecording}
                className="relative z-10 w-[100px] h-[100px] rounded-full flex items-center justify-center shadow-2xl"
                style={{ background: isRecording ? "linear-gradient(135deg,#ef4444,#dc2626)" : "linear-gradient(145deg,#4f8ef7,#2563eb)" }}>
                {isRecording ? <Square className="w-10 h-10 text-white" fill="white" /> : <Mic className="w-11 h-11 text-white" />}
              </motion.button>
            </div>
            {/* Right waveform */}
            <div className="flex items-center gap-[4px] flex-1">
              {[8,14,20,34,28,42,36,48,32,44,28,38,26,16,10].map((h, i) => (
                <motion.div key={i} className="w-[3px] rounded-full flex-shrink-0"
                  style={{ background: isRecording ? "#3b82f6" : "#cbd5e1" }}
                  animate={{ height: isRecording ? [`${h}px`, `${Math.min(h*1.8,70)}px`, `${h}px`] : [`${h*0.6}px`, `${h}px`, `${h*0.6}px`] }}
                  transition={{ duration: isRecording ? 0.65 : 2.2, repeat: Infinity, delay: i*0.05, ease:"easeInOut" }} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Status text */}
        {isIdle && <p className="text-sm text-gray-500 mb-5 flex-shrink-0">Tap the microphone to start recording</p>}
        {isRecording && (
          <div className="flex items-center gap-2 mb-5 flex-shrink-0">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-sm font-mono font-semibold text-gray-800">{formatTime(duration)}</span>
            <span className="text-xs text-gray-400">Recording... tap to stop</span>
          </div>
        )}

        {/* ── STOPPED — playback controls ── */}
        {isStopped && audioUrl && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md flex flex-col items-center gap-4 mb-5 flex-shrink-0">
            <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} />

            {/* Duration badge */}
            <div className="flex items-center gap-2 px-4 py-1.5 bg-white rounded-full border border-gray-200 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs font-semibold text-gray-600">Recording complete — {formatTime(duration)}</span>
            </div>

            {/* Waveform preview (static) */}
            <div className="flex items-center gap-[3px]">
              {[4,8,14,20,12,18,8,14,20,12,16,8,12,18,10,14,6,10,16,8,12,6,10,14,8].map((h, i) => (
                <div key={i} className="w-[3px] rounded-full bg-blue-300/60" style={{ height: `${h}px` }} />
              ))}
            </div>

            {/* Control buttons */}
            <div className="flex items-center gap-3">
              {/* Play/Pause */}
              <button onClick={handlePlayPause}
                className="w-12 h-12 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors">
                {isPlaying ? <Pause className="w-5 h-5 text-gray-700" /> : <Play className="w-5 h-5 text-gray-700 ml-0.5" />}
              </button>

              {/* Re-record */}
              <button onClick={handleReRecord}
                className="w-12 h-12 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors">
                <RefreshCw className="w-5 h-5 text-gray-700" />
              </button>

              {/* Process */}
              <button onClick={handleProcess}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
                <Upload className="w-4 h-4" />
                Process with AI
              </button>
            </div>
          </motion.div>
        )}

        {/* ── PROCESSING loader ── */}
        {isProcessing && (
          <div className="w-full max-w-md mb-4 flex-shrink-0">
            <VoiceProcessingLoader stage={stage} />
          </div>
        )}

        {/* ── COMPLETE — results ── */}
        {stage === "complete" && (transcript || extractedData) && (
          <div className="w-full max-w-md flex flex-col gap-3 mb-4 flex-shrink-0">
            {transcript && <TranscriptCard transcript={transcript} language={language} />}
            {extractedData && <DetectedFieldsCard data={extractedData} />}
          </div>
        )}

        {/* Complete action buttons */}
        {stage === "complete" && extractedData && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 mb-4 flex-shrink-0">
            <button onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 bg-white transition-colors">
              <RefreshCw className="w-4 h-4" /> Re-record
            </button>
            <button onClick={() => onComplete(extractedData)}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
              Continue to Form <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* ── IDLE — instructions card ── */}
        {isIdle && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex-shrink-0">
            <p className="text-sm font-bold text-blue-600 mb-3">Speak naturally in English, Hindi, or Telugu:</p>
            <div className="space-y-2.5">
              {[
                { lang: "EN", text: '"My name is Dr Rahul Sharma. Apollo Hospital. Cardiology. Phone 9876543210. Email rahul@gmail.com."' },
                { lang: "HI", text: '"मेरा नाम डॉ राहुल शर्मा है। अपोलो हॉस्पिटल। कार्डियोलॉजी। फ़ोन 9876543210।"' },
                { lang: "TE", text: '"నా పేరు డాక్టర్ రాహుల్ శర్మ. అపోలో హాస్పిటల్. కార్డియాలజీ. ఫోన్ 9876543210."' },
              ].map(({ lang, text }) => (
                <div key={lang} className="flex items-start gap-3">
                  <span className="text-[10px] font-extrabold text-gray-400 flex-shrink-0 mt-[3px] tracking-wide">{lang}</span>
                  <p className="text-[12px] text-gray-500 italic leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Safety note */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="flex items-center gap-2 mt-4 bg-white border border-blue-100 rounded-full px-4 py-2 shadow-sm flex-shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
          <p className="text-xs text-gray-400">Your information is safe with us. We never share your data.</p>
        </motion.div>
      </div>
    </div>
  );
}
