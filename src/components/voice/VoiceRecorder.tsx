"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Mic, Square } from "lucide-react";
import RecordingControls from "./RecordingControls";

export type VoiceRecordingState = "idle" | "recording" | "stopped" | "processing";

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  onError: (error: string) => void;
  isProcessing?: boolean;
}

export default function VoiceRecorder({ onRecordingComplete, onError, isProcessing = false }: VoiceRecorderProps) {
  const [recordingState, setRecordingState] = useState<VoiceRecordingState>("idle");
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioBlobRef = useRef<Blob | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [audioUrl]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        },
      });
      streamRef.current = stream;

      // Determine supported mime type
      let mimeType = "audio/webm";
      if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
        mimeType = "audio/webm;codecs=opus";
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        audioBlobRef.current = blob;
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setRecordingState("stopped");

        // Release mic
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      };

      mediaRecorder.onerror = () => {
        onError("Recording failed. Please try again.");
        setRecordingState("idle");
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(250);
      setRecordingState("recording");
      setDuration(0);

      // Timer
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        onError("Microphone permission denied. Please allow microphone access and try again.");
      } else if (err.name === "NotFoundError") {
        onError("No microphone found. Please connect a microphone.");
      } else {
        onError("Could not access microphone. Please check your device settings.");
      }
    }
  }, [onError]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, []);

  const handleReRecord = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setRecordingState("idle");
    setDuration(0);
    audioBlobRef.current = null;
  };

  const handleSubmit = () => {
    if (audioBlobRef.current) {
      setRecordingState("processing");
      onRecordingComplete(audioBlobRef.current);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Microphone Button */}
      <div className="relative">
        {/* Pulse rings when recording */}
        {recordingState === "recording" && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full bg-red-400"
              animate={{ scale: [1, 2.2], opacity: [0.5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <motion.div
              className="absolute inset-0 rounded-full bg-red-400"
              animate={{ scale: [1, 2.2], opacity: [0.5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
            />
            <motion.div
              className="absolute inset-0 rounded-full bg-red-300"
              animate={{ scale: [1, 1.8], opacity: [0.3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
            />
          </>
        )}

        <motion.button
          whileHover={{ scale: recordingState === "stopped" ? 1 : 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={recordingState === "recording" ? stopRecording : recordingState === "idle" ? startRecording : undefined}
          disabled={recordingState === "stopped" || recordingState === "processing"}
          className={`relative z-10 w-32 h-32 rounded-full flex items-center justify-center transition-all shadow-xl ${
            recordingState === "recording"
              ? "bg-red-500 hover:bg-red-600 shadow-red-200"
              : recordingState === "stopped" || recordingState === "processing"
              ? "bg-gray-200 cursor-default shadow-none"
              : "bg-gradient-to-br from-drx-500 to-drx-700 hover:from-drx-600 hover:to-drx-800 shadow-drx-200"
          }`}
          aria-label={recordingState === "recording" ? "Stop recording" : "Start recording"}
        >
          {recordingState === "recording" ? (
            <Square className="w-10 h-10 text-white" fill="white" />
          ) : (
            <Mic className={`w-14 h-14 ${recordingState === "idle" ? "text-white" : "text-gray-400"}`} />
          )}
        </motion.button>
      </div>

      {/* Status text */}
      <div className="text-center">
        {recordingState === "recording" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            <span className="text-lg font-mono font-bold text-gray-900">{formatTime(duration)}</span>
          </motion.div>
        )}

        {recordingState === "idle" && (
          <p className="text-sm text-gray-500">Tap the microphone to start recording</p>
        )}

        {recordingState === "processing" && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-drx-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-drx-600 font-medium">Processing with AI...</span>
          </div>
        )}
      </div>

      {/* Animated waveform */}
      {recordingState === "recording" && (
        <div className="flex items-center gap-[3px] h-10">
          {[...Array(16)].map((_, i) => (
            <motion.div
              key={i}
              className="w-[3px] bg-gradient-to-t from-drx-600 to-drx-400 rounded-full"
              animate={{
                height: ["8px", `${Math.random() * 28 + 10}px`, "8px"],
              }}
              transition={{
                duration: 0.6 + Math.random() * 0.4,
                repeat: Infinity,
                delay: i * 0.05,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      )}

      {/* Controls when stopped */}
      {recordingState === "stopped" && audioUrl && (
        <RecordingControls
          audioUrl={audioUrl}
          onReRecord={handleReRecord}
          onSubmit={handleSubmit}
          isProcessing={isProcessing}
          duration={duration}
        />
      )}

      {/* Instructions */}
      {recordingState === "idle" && (
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 max-w-md w-full">
          <p className="text-sm text-drx-700 font-medium mb-2">
            Speak naturally in English, Hindi, or Telugu:
          </p>
          <div className="space-y-1.5">
            <p className="text-xs text-drx-600 italic">
              🇬🇧 &quot;My name is Dr Rahul Sharma. Apollo Hospital. Cardiology. Phone 9876543210. Email rahul@gmail.com.&quot;
            </p>
            <p className="text-xs text-drx-600 italic">
              🇮🇳 &quot;मेरा नाम डॉ राहुल शर्मा है। अपोलो हॉस्पिटल। कार्डियोलॉजी। फ़ोन 9876543210।&quot;
            </p>
            <p className="text-xs text-drx-600 italic">
              🇮🇳 &quot;నా పేరు డాక్టర్ రాహుల్ శర్మ. అపోలో హాస్పిటల్. కార్డియాలజీ. ఫోన్ 9876543210.&quot;
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
