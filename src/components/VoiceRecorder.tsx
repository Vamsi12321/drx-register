"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Mic, Square, Play, Pause, Upload, RotateCcw } from "lucide-react";
import type { RecordingState } from "@/lib/types";

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  isProcessing?: boolean;
}

export default function VoiceRecorder({ onRecordingComplete, isProcessing = false }: VoiceRecorderProps) {
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioBlobRef = useRef<Blob | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm",
      });

      chunksRef.current = [];
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        audioBlobRef.current = blob;
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setRecordingState("stopped");

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(250); // Collect data every 250ms
      setRecordingState("recording");
      setDuration(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Failed to start recording:", error);
      alert("Could not access microphone. Please check permissions.");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, []);

  const handlePlayPause = () => {
    if (!audioRef.current || !audioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleReset = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setRecordingState("idle");
    setDuration(0);
    audioBlobRef.current = null;
  };

  const handleUpload = () => {
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
              animate={{ scale: [1, 2], opacity: [0.4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <motion.div
              className="absolute inset-0 rounded-full bg-red-400"
              animate={{ scale: [1, 2], opacity: [0.4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
            />
          </>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={recordingState === "recording" ? stopRecording : startRecording}
          disabled={recordingState === "stopped" || isProcessing}
          className={`relative z-10 w-28 h-28 rounded-full flex items-center justify-center transition-all shadow-lg ${
            recordingState === "recording"
              ? "bg-red-500 hover:bg-red-600 shadow-red-200"
              : recordingState === "stopped"
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-gradient-to-br from-drx-500 to-drx-700 hover:from-drx-600 hover:to-drx-800 shadow-drx-200"
          }`}
        >
          {recordingState === "recording" ? (
            <Square className="w-10 h-10 text-white" fill="white" />
          ) : (
            <Mic className="w-12 h-12 text-white" />
          )}
        </motion.button>
      </div>

      {/* Timer */}
      <div className="text-center">
        {recordingState === "recording" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            <span className="text-lg font-mono font-semibold text-gray-900">
              {formatTime(duration)}
            </span>
          </motion.div>
        )}

        {recordingState === "idle" && (
          <p className="text-sm text-gray-500">
            Tap to start recording your details
          </p>
        )}

        {recordingState === "stopped" && (
          <p className="text-sm text-gray-500">
            Recording complete — {formatTime(duration)}
          </p>
        )}

        {isProcessing && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-drx-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-drx-600 font-medium">Processing with AI...</span>
          </div>
        )}
      </div>

      {/* Playback & Controls */}
      {recordingState === "stopped" && audioUrl && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <audio
            ref={audioRef}
            src={audioUrl}
            onEnded={() => setIsPlaying(false)}
          />

          <button
            onClick={handlePlayPause}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-gray-700" />
            ) : (
              <Play className="w-5 h-5 text-gray-700 ml-0.5" />
            )}
          </button>

          <button
            onClick={handleReset}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <RotateCcw className="w-5 h-5 text-gray-700" />
          </button>

          <button
            onClick={handleUpload}
            disabled={isProcessing}
            className="flex items-center gap-2 px-5 py-2.5 bg-drx-600 text-white rounded-lg hover:bg-drx-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="w-4 h-4" />
            Process with AI
          </button>
        </motion.div>
      )}

      {/* Recording waves animation */}
      {recordingState === "recording" && (
        <div className="flex items-center gap-1 h-8">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1 bg-drx-500 rounded-full"
              animate={{
                height: ["8px", `${Math.random() * 24 + 8}px`, "8px"],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.1,
              }}
            />
          ))}
        </div>
      )}

      {/* Instructions */}
      {recordingState === "idle" && (
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 max-w-sm">
          <p className="text-sm text-drx-700 font-medium mb-2">Speak naturally, for example:</p>
          <p className="text-xs text-drx-600 italic">
            &quot;My name is Dr Rahul Sharma. I work at Apollo Hospital. Cardiology department. My phone number is 9876543210. Email rahul@gmail.com.&quot;
          </p>
        </div>
      )}
    </div>
  );
}
