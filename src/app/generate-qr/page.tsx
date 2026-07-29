"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import QRGenerator from "@/components/QRGenerator";

export default function GenerateQRPage() {
  const [registrationUrl, setRegistrationUrl] = useState("https://sabra-unrepaid-roselee.ngrok-free.dev/qr-register");

  useEffect(() => {
    // Use current origin so it works on any domain
    setRegistrationUrl(`${window.location.origin}/qr-register`);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-drx-600 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            DRX Permanent QR Code
          </h1>
          <p className="text-gray-500">
            Generate and share this QR code with doctors for registration.
          </p>
        </div>

        {/* QR Generator */}
        <div className="flex justify-center">
          {registrationUrl && <QRGenerator url={registrationUrl} />}
        </div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100"
        >
          <h3 className="font-semibold text-drx-800 mb-2">How it works</h3>
          <ul className="text-sm text-drx-700 space-y-1">
            <li>1. Print or display this QR code at your facility</li>
            <li>2. Doctor scans the QR code</li>
            <li>3. Doctor registers via manual form or AI voice</li>
            <li>4. DRX Admin links pharma organizations later</li>
          </ul>
        </motion.div>
      </motion.div>
    </div>
  );
}
