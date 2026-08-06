"use client";

import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Zap, Link2, Stethoscope } from "lucide-react";
import Image from "next/image";
import NextLink from "next/link";

export default function QRRegisterPage() {
  return (
    <div className="min-h-screen bg-[#f0f4ff] flex flex-col">

      {/* NAVBAR */}
      <nav className="w-full flex-shrink-0 flex items-center justify-between px-5 md:px-12 lg:px-20 py-4">
        <div className="flex items-center gap-2">
          <Stethoscope className="w-6 h-6 md:w-7 md:h-7 text-blue-600" />
          <div>
            <p className="text-sm md:text-base font-extrabold text-gray-900 leading-none">DRX</p>
            <p className="text-[9px] md:text-[10px] text-gray-400 leading-none mt-0.5 hidden sm:block">Doctor Registration Experience</p>
          </div>
        </div>
        <div className="flex items-center gap-1 md:gap-1.5 bg-white/70 border border-blue-100 rounded-full px-3 md:px-4 py-1 md:py-1.5">
          <ShieldCheck className="w-3 h-3 md:w-3.5 md:h-3.5 text-blue-600" />
          <span className="text-[10px] md:text-xs font-semibold text-blue-700">Secure</span>
          <span className="text-blue-300 text-xs hidden sm:inline">•</span>
          <span className="text-[10px] md:text-xs font-semibold text-blue-700 hidden sm:inline">Fast</span>
          <span className="text-blue-300 text-xs hidden sm:inline">•</span>
          <span className="text-[10px] md:text-xs font-semibold text-blue-700 hidden sm:inline">Trusted</span>
        </div>
      </nav>

      {/* HERO */}
      <div className="flex-1 flex flex-col lg:flex-row items-center justify-center px-5 md:px-12 lg:px-20 py-8 gap-8 lg:gap-12">

        {/* LEFT */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full lg:w-[440px] flex-shrink-0 flex flex-col items-center lg:items-start text-center lg:text-left"
        >
          <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-1.5 mb-4 md:mb-5 shadow-sm">
            <span className="text-sm font-semibold text-gray-700">Welcome to DRX</span>
            <span>👋</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-[44px] font-black leading-[1.1] text-gray-900 mb-3">
            Let&apos;s Get You<br />
            <span className="text-blue-600">Onboarded</span>
          </h1>

          <div className="w-12 h-[3px] bg-blue-600 rounded-full mb-4" />

          <p className="text-gray-500 text-sm md:text-[14px] leading-relaxed mb-6 md:mb-7 max-w-xs md:max-w-[340px]">
            Join thousands of doctors already on DRX. Create your digital identity and connect with pharma organizations seamlessly.
          </p>

          {/* Features */}
          <div className="grid grid-cols-3 gap-3 md:gap-5 mb-6 md:mb-8 w-full max-w-sm lg:max-w-none">
            {[
              { icon: ShieldCheck, title: "Verified & Secure", desc: "Bank-level security" },
              { icon: Link2, title: "Pharma Connected", desc: "Trusted pharma links" },
              { icon: Zap, title: "AI Powered", desc: "Smart voice registration" },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex flex-col gap-1">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-white flex items-center justify-center shadow-sm mx-auto lg:mx-0">
                  <Icon className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-600" />
                </div>
                <p className="text-[10px] md:text-[12px] font-bold text-gray-900 leading-tight">{title}</p>
                <p className="text-[9px] md:text-[11px] text-gray-400 leading-tight hidden sm:block">{desc}</p>
              </div>
            ))}
          </div>

          <NextLink href="/register" className="w-full max-w-sm lg:max-w-none">
            <motion.button
              whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 py-3 md:py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm md:text-[15px] transition-colors shadow-lg shadow-blue-200/60"
            >
              Continue to Registration
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
            </motion.button>
          </NextLink>

          <div className="flex items-center gap-1.5 mt-3 md:mt-4 justify-center lg:justify-start">
            <ShieldCheck className="w-3 h-3 text-gray-400 flex-shrink-0" />
            <p className="text-[10px] md:text-[11px] text-gray-400">Your information is safe with us.</p>
          </div>
        </motion.div>

        {/* RIGHT — doctor image — hidden on small mobile */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="hidden sm:flex flex-1 relative items-center justify-center"
          style={{ minHeight: 300 }}
        >
          <div className="absolute w-64 h-64 md:w-80 md:h-80 lg:w-[420px] lg:h-[420px] rounded-full bg-blue-200/50" />
          <div className="absolute opacity-40 hidden md:grid"
            style={{ top: "8%", left: "8%", gridTemplateColumns: "repeat(6,1fr)", gap: 8 }}>
            {[...Array(30)].map((_, i) => <div key={i} className="w-1 h-1 rounded-full bg-blue-400" />)}
          </div>
          <span className="absolute top-[12%] right-[15%] text-blue-300 text-2xl select-none hidden md:block">+</span>
          <span className="absolute bottom-[20%] right-[8%] text-blue-300 text-2xl select-none hidden md:block">+</span>
          <div className="relative z-10">
            <Image src="/images/doctor.png" alt="Doctor"
              width={260} height={320}
              className="object-contain mix-blend-multiply select-none md:w-[320px] lg:w-[380px]"
              priority />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
