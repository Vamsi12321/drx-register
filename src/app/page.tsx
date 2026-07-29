"use client";

import { motion } from "framer-motion";
import { ArrowRight, QrCode, Shield, Zap } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-3xl mx-auto"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-drx-500 to-drx-700 shadow-lg shadow-drx-200 mb-8"
        >
          <span className="text-white font-bold text-2xl">DRX</span>
        </motion.div>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Doctor Registration
          <span className="text-drx-600"> Experience</span>
        </h1>

        <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto">
          A centralized doctor identity platform. Register once with a permanent QR code.
          Pharmaceutical organizations connect through DRX.
        </p>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-4 rounded-xl bg-white border border-blue-100 shadow-sm"
          >
            <QrCode className="w-8 h-8 text-drx-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900">Permanent QR</h3>
            <p className="text-sm text-gray-500">One-time registration with a permanent identity code</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-4 rounded-xl bg-white border border-blue-100 shadow-sm"
          >
            <Zap className="w-8 h-8 text-drx-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900">AI-Powered</h3>
            <p className="text-sm text-gray-500">Voice registration with intelligent data extraction</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="p-4 rounded-xl bg-white border border-blue-100 shadow-sm"
          >
            <Shield className="w-8 h-8 text-drx-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900">Secure</h3>
            <p className="text-sm text-gray-500">Validated and verified doctor profiles</p>
          </motion.div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/generate-qr">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-drx-600 text-white rounded-xl font-semibold hover:bg-drx-700 transition-colors shadow-lg shadow-drx-200"
            >
              <QrCode className="w-5 h-5" />
              Generate QR Code
            </motion.button>
          </Link>

          <Link href="/qr-register">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 border-2 border-drx-200 text-drx-700 rounded-xl font-semibold hover:bg-drx-50 transition-colors"
            >
              Simulate QR Scan
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
