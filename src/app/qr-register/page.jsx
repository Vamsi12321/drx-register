"use client";

import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Zap, Link2, Stethoscope } from "lucide-react";
import Image from "next/image";
import NextLink from "next/link";

export default function QRRegisterPage() {
  return (
    <div className="h-screen bg-[#f0f4ff] flex flex-col overflow-hidden">

      {/* NAVBAR */}
      <nav className="w-full flex-shrink-0 flex items-center justify-between px-10 md:px-20 py-4">
        <div className="flex items-center gap-2.5">
          <Stethoscope className="w-7 h-7 text-blue-600" />
          <div>
            <p className="text-[16px] font-extrabold text-gray-900 leading-none">DRX</p>
            <p className="text-[10px] text-gray-400 leading-none mt-0.5">Doctor Registration Experience</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-white/70 border border-blue-100 rounded-full px-4 py-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-xs font-semibold text-blue-700">Secure</span>
          <span className="text-blue-300 text-xs">•</span>
          <span className="text-xs font-semibold text-blue-700">Fast</span>
          <span className="text-blue-300 text-xs">•</span>
          <span className="text-xs font-semibold text-blue-700">Trusted</span>
        </div>
      </nav>

      {/* HERO — fills remaining height */}
      <div className="flex-1 flex flex-row items-center px-10 md:px-20 gap-8 overflow-hidden">

        {/* LEFT */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-[440px] flex-shrink-0 flex flex-col"
        >
          {/* Welcome badge */}
          <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-1.5 mb-5 self-start shadow-sm">
            <span className="text-sm font-semibold text-gray-700">Welcome to DRX</span>
            <span>👋</span>
          </div>

          {/* Headline */}
          <h1 className="text-[44px] font-black leading-[1.1] text-gray-900 mb-3">
            Let&apos;s Get You<br />
            <span className="text-blue-600">Onboarded</span>
          </h1>

          {/* Blue bar */}
          <div className="w-12 h-[3px] bg-blue-600 rounded-full mb-4" />

          {/* Subtitle */}
          <p className="text-gray-500 text-[14px] leading-relaxed mb-7 max-w-[340px]">
            Join thousands of doctors already on DRX. Create your digital identity and connect with pharma organizations seamlessly.
          </p>

          {/* 3 features in a row */}
          <div className="grid grid-cols-3 gap-5 mb-8">
            {[
              { icon: ShieldCheck, title: "Verified & Secure",  desc: "Bank-level security for your data" },
              { icon: Link2,       title: "Pharma Connected",   desc: "Get linked with trusted pharma organizations" },
              { icon: Zap,         title: "AI Powered",         desc: "Smart voice registration makes it effortless" },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex flex-col gap-1.5">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                  <Icon className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-[12px] font-bold text-gray-900 leading-tight">{title}</p>
                <p className="text-[11px] text-gray-400 leading-tight">{desc}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <NextLink href="/register">
            <motion.button
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-[15px] transition-colors shadow-lg shadow-blue-200/60"
            >
              Continue to Registration
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </NextLink>

          {/* Safety */}
          <div className="flex items-center gap-1.5 mt-4">
            <ShieldCheck className="w-3 h-3 text-gray-400 flex-shrink-0" />
            <p className="text-[11px] text-gray-400">Your information is safe with us. We never share your data.</p>
          </div>
        </motion.div>

        {/* RIGHT — doctor image */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex-1 relative flex items-center justify-center h-full overflow-hidden"
        >
          {/* Background circle */}
          <div className="absolute w-[420px] h-[420px] rounded-full bg-blue-200/50" />

          {/* Dot grid */}
          <div
            className="absolute opacity-40"
            style={{
              top: "8%", left: "8%",
              display: "grid",
              gridTemplateColumns: "repeat(6,1fr)",
              gap: "8px",
            }}
          >
            {[...Array(30)].map((_, i) => (
              <div key={i} className="w-1 h-1 rounded-full bg-blue-400" />
            ))}
          </div>

          {/* Plus decorations */}
          <span className="absolute top-[12%] right-[15%] text-blue-300 text-2xl select-none">+</span>
          <span className="absolute bottom-[20%] right-[8%] text-blue-300 text-2xl select-none">+</span>

          {/* Doctor image */}
          <div className="relative z-10">
            <Image
              src="/images/doctor.png"
              alt="Doctor"
              width={380}
              height={460}
              className="object-contain mix-blend-multiply select-none"
              priority
            />
          </div>
        </motion.div>

      </div>
    </div>
  );
}
