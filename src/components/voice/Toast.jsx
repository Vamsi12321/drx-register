"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle, CheckCircle2, Info } from "lucide-react";

export default function Toast({ toasts, onDismiss }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      <AnimatePresence>
        {toasts.map((toast) => <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />)}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ toast, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 5000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const styles = {
    error: { bg: "bg-red-50 border-red-200", icon: AlertCircle, iconColor: "text-red-500", titleColor: "text-red-800" },
    success: { bg: "bg-green-50 border-green-200", icon: CheckCircle2, iconColor: "text-green-500", titleColor: "text-green-800" },
    info: { bg: "bg-blue-50 border-blue-200", icon: Info, iconColor: "text-blue-500", titleColor: "text-blue-800" },
  };

  const style = styles[toast.type];
  const Icon = style.icon;

  return (
    <motion.div initial={{ opacity: 0, x: 50, scale: 0.95 }} animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.95 }}
      className={`p-4 rounded-xl border shadow-lg ${style.bg} flex items-start gap-3`}>
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${style.iconColor}`} />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${style.titleColor}`}>{toast.title}</p>
        {toast.message && <p className="text-xs text-gray-600 mt-0.5">{toast.message}</p>}
      </div>
      <button onClick={() => onDismiss(toast.id)} className="flex-shrink-0 p-1 rounded-full hover:bg-black/5 transition-colors">
        <X className="w-4 h-4 text-gray-400" />
      </button>
    </motion.div>
  );
}
