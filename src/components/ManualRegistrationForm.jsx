"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Mail, Phone, Building2, Send,
  ShieldCheck, Zap, BarChart2, ChevronDown,
  Navigation, Search, MapPin
} from "lucide-react";
import Image from "next/image";
import { doctorRegistrationSchema } from "@/lib/validation";
import SpecializationSelect from "./SpecializationSelect";
import SearchLocation from "./SearchLocation";
import CurrentLocationButton from "./CurrentLocationButton";
import dynamic from "next/dynamic";
import { useState } from "react";

const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-blue-50 rounded-xl animate-pulse" />,
});

const iconStyle = {
  position: "absolute", left: 10, top: "50%",
  transform: "translateY(-50%)", width: 13, height: 13,
  color: "#93c5fd", pointerEvents: "none",
};

export default function ManualRegistrationForm({ prefillData, onSubmit }) {
  const [locationData, setLocationData] = useState({
    latitude: "", longitude: "", address: "", city: "", state: "", country: "",
  });
  const [mapPosition, setMapPosition] = useState(null);
  const [locTab, setLocTab] = useState("search");

  // Accordion state — all open by default
  const [open, setOpen] = useState({ personal: true, professional: true, location: true });
  const toggle = (key) => setOpen((p) => ({ ...p, [key]: !p[key] }));

  const { register, control, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(doctorRegistrationSchema),
    defaultValues: {
      name: prefillData?.name || "",
      email: prefillData?.email || "",
      phone: prefillData?.phone || "",
      hospital: prefillData?.hospital || "",
      department: prefillData?.department || "",
      location: locationData,
    },
  });

  const handleLocationChange = (lat, lng, data) => {
    setMapPosition([lat, lng]);
    setLocationData(data);
  };

  const handleFormSubmit = (data) => onSubmit({ ...data, location: locationData });

  const inp = (err) =>
    `w-full pl-9 pr-3 py-2.5 text-sm rounded-2xl border outline-none transition-all ${
      err
        ? "border-red-300 bg-red-50/30 focus:border-red-400"
        : "border-gray-200 bg-gray-50/80 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
    }`;

  return (
    <div className="min-h-screen md:h-screen bg-[#eef1fb] flex flex-col md:flex-row md:overflow-hidden">

      {/* ── LEFT sidebar ── */}
      <div className="hidden md:flex w-[38%] flex-shrink-0 relative overflow-hidden flex-col"
        style={{ background: "linear-gradient(160deg, #d8e8ff 0%, #eef1fb 100%)" }}>
        <div className="absolute w-64 h-64 rounded-full bg-blue-200/25 -top-20 -left-20" />
        <div className="absolute w-44 h-44 rounded-full bg-indigo-200/20 bottom-28 -right-14" />
        <span className="absolute top-1/4 right-10 text-blue-300/30 text-4xl select-none">+</span>
        <span className="absolute bottom-36 left-8 text-blue-300/30 text-4xl select-none">+</span>

        <div className="relative z-10 flex flex-col h-full px-8 py-8">
          <div className="mb-6">
            <span className="inline-block text-[10px] font-bold text-blue-500 bg-blue-100/80 rounded-full px-3 py-1 mb-3 tracking-wide">
              WELCOME TO DRX
            </span>
            <h2 className="text-[28px] font-black text-gray-900 leading-tight mb-2">
              Your Digital<br />
              <span className="text-blue-600">Medical Identity</span>
            </h2>
            <p className="text-[11px] text-gray-500 leading-relaxed max-w-[220px]">
              Create your professional account and access powerful tools built for healthcare professionals.
            </p>
          </div>

          <div className="flex-1 flex items-end justify-center">
            <Image src="/images/dr_register.png" alt="Doctor" width={240} height={280}
              className="object-contain mix-blend-multiply" priority />
          </div>

          <div className="space-y-3 mt-4">
            {[
              { icon: ShieldCheck, color: "#3b82f6", bg: "#eff6ff", title: "Secure & Trusted", desc: "Enterprise-grade security for your data." },
              { icon: Zap, color: "#f59e0b", bg: "#fffbeb", title: "AI Powered", desc: "Smart tools to boost your practice." },
              { icon: BarChart2, color: "#10b981", bg: "#f0fdf4", title: "Grow Your Practice", desc: "Connect and engage with DRX." },
            ].map(({ icon: Icon, color, bg, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm" style={{ background: bg }}>
                  <Icon style={{ width: 13, height: 13, color }} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-gray-800 leading-none">{title}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT ── */}
      <div className="flex-1 flex flex-col md:overflow-hidden" style={{ background: "#f4f7ff" }}>

        {/* Header */}
        <div className="flex-shrink-0 flex items-center gap-3 px-4 md:px-8 pt-4 md:pt-5 pb-3">
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-2xl bg-white border border-blue-100 shadow-sm flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 3a1 1 0 0 0-1 1v5a5 5 0 0 0 10 0V4a1 1 0 0 0-1-1"/>
              <path d="M8 3v3m4-3v3"/>
              <path d="M10 14v2a4 4 0 0 0 8 0v-3"/>
              <circle cx="18" cy="13" r="1.5" fill="#3b82f6" stroke="none"/>
            </svg>
          </div>
          <div>
            <h1 className="text-base md:text-lg font-black text-gray-900 leading-none">Registration Form</h1>
            <p className="text-[10px] text-gray-400 mt-0.5">Fill in your details to register with DRX</p>
          </div>
        </div>

        {/* Scrollable form */}
        <form className="flex-1 overflow-y-auto px-4 md:px-8 pb-3 space-y-2.5"
          onSubmit={handleSubmit(handleFormSubmit)}>

          {/* ── Personal Information ── */}
          <AccordionSection
            icon={<User className="w-3.5 h-3.5 text-white" />}
            iconBg="bg-blue-500"
            title="Personal Information"
            subtitle="Let's start with your basic details"
            isOpen={open.personal}
            onToggle={() => toggle("personal")}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Label label="Full Name" error={errors.name?.message}>
                <div className="relative">
                  <User style={iconStyle} />
                  <input type="text" placeholder="Dr. Rahul Sharma" {...register("name")} className={inp(errors.name)} />
                </div>
              </Label>
              <Label label="Email Address" error={errors.email?.message}>
                <div className="relative">
                  <Mail style={iconStyle} />
                  <input type="email" placeholder="rahul@gmail.com" {...register("email")} className={inp(errors.email)} />
                </div>
              </Label>
              <Label label="Phone Number" error={errors.phone?.message}>
                <div className="relative">
                  <Phone style={iconStyle} />
                  <input type="tel" placeholder="9876543210" {...register("phone")} className={inp(errors.phone)} />
                </div>
              </Label>
            </div>
          </AccordionSection>

          {/* ── Professional Information ── */}
          <AccordionSection
            icon={<Building2 className="w-3.5 h-3.5 text-white" />}
            iconBg="bg-violet-500"
            title="Professional Information"
            subtitle="Tell us about your practice"
            isOpen={open.professional}
            onToggle={() => toggle("professional")}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Label label="Hospital / Clinic" error={errors.hospital?.message}>
                <div className="relative">
                  <Building2 style={iconStyle} />
                  <input type="text" placeholder="Apollo Hospital" {...register("hospital")} className={inp(errors.hospital)} />
                </div>
              </Label>
              <Label label="Department / Specialization" error={errors.department?.message}>
                <Controller name="department" control={control}
                  render={({ field }) => (
                    <SpecializationSelect value={field.value} onChange={field.onChange} error={errors.department?.message} />
                  )} />
              </Label>
            </div>
          </AccordionSection>

          {/* ── Location Information ── */}
          <AccordionSection
            icon={<MapPin className="w-3.5 h-3.5 text-white" />}
            iconBg="bg-emerald-500"
            title="Location Information"
            subtitle="Where is your practice located?"
            isOpen={open.location}
            onToggle={() => toggle("location")}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2.5">
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => setLocTab("current")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-semibold transition-all ${
                      locTab === "current" ? "bg-blue-600 text-white shadow-sm" : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                    }`}>
                    <Navigation className="w-2.5 h-2.5" /> Use Current Location
                  </button>
                  <button type="button" onClick={() => setLocTab("search")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-semibold transition-all ${
                      locTab === "search" ? "bg-gray-800 text-white shadow-sm" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}>
                    <Search className="w-2.5 h-2.5" /> Search Location
                  </button>
                </div>
                {locTab === "current" && <CurrentLocationButton onLocationDetected={handleLocationChange} />}
                {locTab === "search" && <SearchLocation onLocationSelected={handleLocationChange} />}
              </div>
              <div className="h-36 rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                <LeafletMap position={mapPosition} onPositionChange={handleLocationChange} />
              </div>
            </div>
          </AccordionSection>
        </form>

        {/* Submit */}
        <div className="flex-shrink-0 px-4 md:px-8 py-3 bg-white/80 backdrop-blur border-t border-gray-100">
          <motion.button
            whileHover={{ scale: 1.005 }} whileTap={{ scale: 0.995 }}
            type="button" onClick={handleSubmit(handleFormSubmit)} disabled={isSubmitting}
            className="w-full py-3 rounded-2xl text-white font-bold text-sm flex flex-col items-center gap-0.5 disabled:opacity-50 shadow-lg shadow-blue-200/50"
            style={{ background: "linear-gradient(135deg,#3b82f6,#6366f1)" }}>
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4" /> Review &amp; Continue
            </div>
            <span className="text-[9px] font-normal opacity-70">Please review your information before submitting</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
}

// ── Accordion Section ──
function AccordionSection({ icon, iconBg, title, subtitle, isOpen, onToggle, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header — clickable */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-xl ${iconBg} flex items-center justify-center shadow-sm`}>
            {icon}
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-gray-800 leading-none">{title}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{subtitle}</p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="flex-shrink-0"
        >
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </motion.div>
      </button>

      {/* Animated content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div className="px-4 py-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Label({ label, error, children }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#6b7280", marginBottom: 6, letterSpacing: "0.01em" }}>
        {label}
      </label>
      {children}
      {error && <p style={{ fontSize: "9px", color: "#ef4444", marginTop: 4 }}>{error}</p>}
    </div>
  );
}
