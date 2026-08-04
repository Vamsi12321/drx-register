"use client";

import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, Upload } from "lucide-react";
import { useRef, useState } from "react";

export default function RecordingControls({ audioUrl, onReRecord, onSubmit, isProcessing, duration }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
    else { audioRef.current.play(); setIsPlaying(true); }
  };

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-4">
      <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} />

      <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
        <div className="w-2 h-2 rounded-full bg-green-500" />
        <span className="text-xs font-medium text-gray-600">Recording — {formatTime(duration)}</span>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={handlePlayPause} disabled={isProcessing} aria-label={isPlaying ? "Pause" : "Play"}
          className="w-11 h-11 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors disabled:opacity-50">
          {isPlaying ? <Pause className="w-5 h-5 text-gray-700" /> : <Play className="w-5 h-5 text-gray-700 ml-0.5" />}
        </button>

        <button onClick={onReRecord} disabled={isProcessing} aria-label="Re-record"
          className="w-11 h-11 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors disabled:opacity-50">
          <RotateCcw className="w-5 h-5 text-gray-700" />
        </button>

        <button onClick={onSubmit} disabled={isProcessing}
          className="flex items-center gap-2 px-6 py-2.5 bg-drx-600 text-white rounded-xl hover:bg-drx-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
          {isProcessing ? (
            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Processing...</>
          ) : (
            <><Upload className="w-4 h-4" />Process with AI</>
          )}
        </button>
      </div>
    </motion.div>
  );
}
