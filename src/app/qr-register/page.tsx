"use client";

import { motion } from "framer-motion";
import { ArrowRight, Stethoscope } from "lucide-react";
import Link from "next/link";

export default function QRRegisterPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md text-center"
      >
        {/* Welcome Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-blue-100 p-8 md:p-12">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-drx-100 to-drx-200 mb-6"
          >
            <Stethoscope className="w-12 h-12 text-drx-600" />
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Welcome to DRX
            </h1>
            <p className="text-gray-500 mb-2">
              Doctor Registration Experience
            </p>
            <p className="text-sm text-gray-400 mb-8">
              Register once. Get a permanent digital identity.
              Pharma organizations will be linked by DRX Admin.
            </p>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Link href="/register">
              <button className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-drx-600 to-drx-700 text-white rounded-xl font-semibold hover:from-drx-700 hover:to-drx-800 transition-all shadow-lg shadow-drx-200 transform hover:scale-[1.02] active:scale-[0.98]">
                Continue to Registration
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
          </motion.div>

          {/* Badge */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-6 text-xs text-gray-400"
          >
            Powered by AI Voice Registration
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
