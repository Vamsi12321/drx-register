"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import {
  User, Mail, Phone, Building2, Send,
  Award, Hash, ShieldCheck, Zap, BarChart2,
  ChevronUp, Navigation, Search, MapPin
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
  loading: () => <div className="w-full h-full bg-blue-50 rounded-lg animate-pulse" />,
});

export default function ManualRegistrationForm({ prefillData, onSubmit }) {
  const [locationData, setLocationData] = useState({
    latitude: "", longitude: "", address: "", city: "", state: "", country: "",
  });
  const [mapPosition, setMapPosition] = useState(null);
  const [locTab, setLocTab] = useState("search");

  const { register, control, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(doctorRegistrationSchema),
    defaultValues: {
      name: prefillData?.name || "",
      email: prefillData?.email || "",
      phone: prefillData?.phone || "",
      hospital: prefillData?.hospital || "",
      department: prefillData?.department || "",
      experience: "",
      medicalRegNumber: "",
      location: locationData,
    },
  });

  const handleLocationChange = (lat, lng, data) => {
    setMapPosition([lat, lng]);
    setLocationData(data);
  };

  const handleFormSubmit = (data) => onSubmit({ ...data, location: locationData });

  // Tiny input style
  const inp = (err) =>
    `w-full pl-7 pr-2 py-1.5 text-[11px] rounded-lg border outline-none transition-all bg-white ${
      err ? "border-red-300" : "border-gray-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
    }`;

  return (
    <div className="h-screen bg-[#eef1fb] flex overflow-hidden">

      {/* ── LEFT SIDEBAR ── */}
      <div className="w-48 flex-shrink-0 bg-gradient-to-b from-[#dce6ff] to-[#eef1fb] flex flex-col px-4 py-4 relative overflow-hidden">
        <span className="absolute top-12 right-3 text-blue-300/50 text-xl select-none">+</span>
        <span className="absolute bottom-28 left-2 text-blue-300/50 text-xl select-none">+</span>
        {/* dot grid */}
        <div className="absolute bottom-48 right-2 grid gap-1 opacity-30" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
          {[...Array(12)].map((_, i) => <div key={i} className="w-1 h-1 rounded-full bg-blue-400" />)}
        </div>

        <div className="mb-2">
          <p className="text-[9px] text-gray-400 font-medium">Welcome to</p>
          <h2 className="text-[18px] font-black leading-none">
            <span className="text-gray-900">Welcome to </span>
            <span className="text-blue-600">DRX</span>
          </h2>
          <p className="text-[9px] text-gray-400 mt-1 leading-relaxed">
            Create your professional account<br />and access powerful tools<br />built for healthcare professionals.
          </p>
        </div>

        {/* Doctor image */}
        <div className="flex-1 flex items-end justify-center">
          <Image
            src="/images/dr_register.png"
            alt="Doctor"
            width={160}
            height={190}
            className="object-contain mix-blend-multiply"
            priority
          />
        </div>

        {/* Features */}
        <div className="space-y-2 mt-1">
          {[
            { icon: ShieldCheck, color: "text-blue-500", title: "Secure & Trusted", desc: "Your data is protected with enterprise-grade security." },
            { icon: Zap, color: "text-yellow-500", title: "AI Powered", desc: "Smart insights and AI tools to boost your practice." },
            { icon: BarChart2, color: "text-green-500", title: "Grow Your Practice", desc: "Connect, engage and grow with DRX platform." },
          ].map(({ icon: Icon, color, title, desc }) => (
            <div key={title} className="flex items-start gap-1.5">
              <div className="w-5 h-5 rounded-md bg-white shadow-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon className={`w-2.5 h-2.5 ${color}`} />
              </div>
              <div>
                <p className="text-[9px] font-bold text-gray-700 leading-none">{title}</p>
                <p className="text-[8px] text-gray-400 leading-tight mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex-shrink-0 flex items-center gap-2.5 px-5 pt-4 pb-2">
          <div className="w-8 h-8 rounded-xl bg-white border border-blue-100 shadow-sm flex items-center justify-center">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 3a1 1 0 0 0-1 1v5a5 5 0 0 0 10 0V4a1 1 0 0 0-1-1"/>
              <path d="M8 3v3m4-3v3"/>
              <path d="M10 14v2a4 4 0 0 0 8 0v-3"/>
              <circle cx="18" cy="13" r="1.5" fill="#3b82f6" stroke="none"/>
            </svg>
          </div>
          <div>
            <h1 className="text-base font-black text-gray-900 leading-none">Registration Form</h1>
            <p className="text-[9px] text-gray-400 mt-0.5">Fill in your details to register with DRX</p>
          </div>
        </div>

        {/* Sections */}
        <div className="flex-1 overflow-y-auto px-5 pb-3 space-y-2">

          {/* Personal Information */}
          <SectionCard
            icon={<User className="w-3 h-3 text-white" />}
            iconBg="bg-blue-500"
            title="Personal Information"
            subtitle="Let's start with your basic details"
          >
            <div className="grid grid-cols-3 gap-2.5">
              <FieldWrap label="Full Name" error={errors.name?.message}>
                <div className="relative">
                  <User style={{position:"absolute",left:7,top:"50%",transform:"translateY(-50%)",width:11,height:11,color:"#d1d5db"}} />
                  <input type="text" placeholder="Dr. Rahul Sharma" {...register("name")} className={inp(errors.name)} />
                </div>
              </FieldWrap>
              <FieldWrap label="Email Address" error={errors.email?.message}>
                <div className="relative">
                  <Mail style={{position:"absolute",left:7,top:"50%",transform:"translateY(-50%)",width:11,height:11,color:"#d1d5db"}} />
                  <input type="email" placeholder="rahul@gmail.com" {...register("email")} className={inp(errors.email)} />
                </div>
              </FieldWrap>
              <FieldWrap label="Phone Number" error={errors.phone?.message}>
                <div className="relative">
                  <Phone style={{position:"absolute",left:7,top:"50%",transform:"translateY(-50%)",width:11,height:11,color:"#d1d5db"}} />
                  <input type="tel" placeholder="9876543210" {...register("phone")} className={inp(errors.phone)} />
                </div>
              </FieldWrap>
            </div>
          </SectionCard>

          {/* Professional Information */}
          <SectionCard
            icon={<Building2 className="w-3 h-3 text-white" />}
            iconBg="bg-purple-500"
            title="Professional Information"
            subtitle="Tell us about your practice"
          >
            <div className="grid grid-cols-2 gap-2.5 mb-2.5">
              <FieldWrap label="Hospital / Clinic" error={errors.hospital?.message}>
                <div className="relative">
                  <Building2 style={{position:"absolute",left:7,top:"50%",transform:"translateY(-50%)",width:11,height:11,color:"#d1d5db"}} />
                  <input type="text" placeholder="Apollo Hospital" {...register("hospital")} className={inp(errors.hospital)} />
                </div>
              </FieldWrap>
              <FieldWrap label="Department / Specialization" error={errors.department?.message}>
                <Controller name="department" control={control}
                  render={({ field }) => (
                    <SpecializationSelect value={field.value} onChange={field.onChange} error={errors.department?.message} />
                  )} />
              </FieldWrap>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <FieldWrap label="Experience (in years)">
                <div className="relative">
                  <Award style={{position:"absolute",left:7,top:"50%",transform:"translateY(-50%)",width:11,height:11,color:"#d1d5db"}} />
                  <input type="number" min="0" placeholder="8" {...register("experience")} className={inp(false)} />
                </div>
              </FieldWrap>
              <FieldWrap label="Medical Registration Number">
                <div className="relative">
                  <Hash style={{position:"absolute",left:7,top:"50%",transform:"translateY(-50%)",width:11,height:11,color:"#d1d5db"}} />
                  <input type="text" placeholder="APMC/FMR/12345" {...register("medicalRegNumber")} className={inp(false)} />
                </div>
              </FieldWrap>
            </div>
          </SectionCard>

          {/* Location Information */}
          <SectionCard
            icon={<MapPin className="w-3 h-3 text-white" />}
            iconBg="bg-green-500"
            title="Location Information"
            subtitle="Where is your practice located?"
          >
            <div className="grid grid-cols-2 gap-2.5">
              {/* Left controls */}
              <div className="flex flex-col gap-2">
                <div className="flex gap-1.5">
                  <button type="button" onClick={() => setLocTab("current")}
                    className={`flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-bold transition-all ${
                      locTab === "current" ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-600"
                    }`}>
                    <Navigation className="w-2 h-2" /> Use Current Location
                  </button>
                  <button type="button" onClick={() => setLocTab("search")}
                    className={`flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-bold transition-all ${
                      locTab === "search" ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-500"
                    }`}>
                    <Search className="w-2 h-2" /> Search Location
                  </button>
                </div>
                {locTab === "current" && <CurrentLocationButton onLocationDetected={handleLocationChange} />}
                {locTab === "search" && <SearchLocation onLocationSelected={handleLocationChange} />}
              </div>
              {/* Map */}
              <div className="h-32 rounded-lg overflow-hidden border border-gray-200">
                <LeafletMap position={mapPosition} onPositionChange={handleLocationChange} />
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Submit */}
        <div className="flex-shrink-0 px-5 py-2.5 bg-white border-t border-gray-100">
          <motion.button
            whileHover={{ scale: 1.003 }} whileTap={{ scale: 0.997 }}
            type="button"
            onClick={handleSubmit(handleFormSubmit)}
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-xl text-white font-bold text-xs flex flex-col items-center gap-0.5 shadow-lg disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#3b82f6,#6366f1)" }}
          >
            <div className="flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5" /> Review & Continue
            </div>
            <span className="text-[9px] font-normal opacity-70">Please review your information before submitting</span>
          </motion.button>
        </div>
      </div>

    </div>
  );
}

function SectionCard({ icon, iconBg, title, subtitle, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-50">
        <div className="flex items-center gap-2">
          <div className={`w-5 h-5 rounded-md ${iconBg} flex items-center justify-center`}>{icon}</div>
          <div>
            <p className="text-[11px] font-bold text-gray-800 leading-none">{title}</p>
            <p className="text-[9px] text-gray-400 mt-0.5">{subtitle}</p>
          </div>
        </div>
        <ChevronUp className="w-3.5 h-3.5 text-gray-300" />
      </div>
      <div className="px-3 py-2.5">{children}</div>
    </div>
  );
}

function FieldWrap({ label, error, children }) {
  return (
    <div>
      <label style={{ display:"block", fontSize:"9px", fontWeight:600, color:"#6b7280", marginBottom:"3px" }}>
        {label}
      </label>
      <div style={{ position:"relative" }}>{children}</div>
      {error && <p style={{ fontSize:"8px", color:"#ef4444", marginTop:"2px" }}>{error}</p>}
    </div>
  );
}
