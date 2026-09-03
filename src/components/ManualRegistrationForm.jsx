"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Mail, Phone, Building2, Send,
  ShieldCheck, Zap, BarChart2, ChevronDown,
  MapPin, Key, Eye, EyeOff,
  RefreshCw, AtSign, Plus
} from "lucide-react";
import { doctorRegistrationSchema, generateUsername, generatePassword } from "@/lib/validation";
import SpecializationSelect from "./SpecializationSelect";
import LocationCard from "./LocationCard";
import { useState, useEffect } from "react";

const iconStyle = {
  position: "absolute", left: 10, top: "50%",
  transform: "translateY(-50%)", width: 13, height: 13,
  color: "#93c5fd", pointerEvents: "none",
};

const PRIORITY_ORDER = ["PRIMARY", "SECONDARY", "OTHER"];

function emptyLocation(priority) {
  return {
    location_priority: priority,
    facility_type: "",
    facility_type_other: "",
    location_name: "",
    latitude: "", longitude: "", address: "",
    area: "", city: "", district: "", state: "", country: "", postcode: "",
    location_source: "",
    _mapPos: null,
  };
}

export default function ManualRegistrationForm({ prefillData, onSubmit, submitError, isSubmitting: parentSubmitting }) {
  // Locations array — PRIMARY + SECONDARY shown by default
  const [locations, setLocations] = useState([emptyLocation("PRIMARY"), emptyLocation("SECONDARY")]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [sameAsPassword, setSameAsPassword] = useState(false);

  const [open, setOpen] = useState({ personal: true, professional: true, account: true, location: true });
  const toggle = (key) => setOpen((p) => ({ ...p, [key]: !p[key] }));

  const { register, control, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(doctorRegistrationSchema),
    defaultValues: {
      name: prefillData?.name || "",
      email: prefillData?.email || "",
      phone: prefillData?.phone || "",
      hospital: prefillData?.hospital || "",
      department: prefillData?.department || "",
      username: prefillData?.name ? generateUsername(prefillData.name) : "",
      password: "",
      confirmPassword: "",
    },
  });

  const nameValue = watch("name");
  const usernameValue = watch("username");
  const passwordValue = watch("password");

  // Auto-generate username and password when name changes
  useEffect(() => {
    if (nameValue && nameValue.trim().length >= 2) {
      const generated = generateUsername(nameValue);
      if (generated) {
        setValue("username", generated);
        const pwd = generatePassword(generated);
        setValue("password", pwd);
        setValue("confirmPassword", pwd);
      }
    }
  }, [nameValue, setValue]);

  // Sync confirm password when checkbox is checked
  useEffect(() => {
    if (sameAsPassword) {
      setValue("confirmPassword", passwordValue);
    }
  }, [sameAsPassword, setValue]);

  const handleGenerateUsername = () => {
    const generated = generateUsername(nameValue);
    if (generated) {
      setValue("username", generated);
      const pwd = generatePassword(generated);
      setValue("password", pwd);
      if (sameAsPassword) {
        setValue("confirmPassword", pwd);
      }
    }
  };

  // Auto-fill PRIMARY location name from hospital field
  const hospitalValue = watch("hospital");
  useEffect(() => {
    if (hospitalValue && hospitalValue.trim()) {
      setLocations((prev) => {
        if (prev.length === 0) return prev;
        // Only set if the primary location_name is empty
        if (prev[0].location_name) return prev;
        const copy = [...prev];
        copy[0] = { ...copy[0], location_name: hospitalValue };
        return copy;
      });
    }
  }, [hospitalValue]);

  // Re-assign priorities based on index
  const reassignPriorities = (list) =>
    list.map((loc, i) => ({
      ...loc,
      location_priority: i === 0 ? "PRIMARY" : i === 1 ? "SECONDARY" : "OTHER",
    }));

  const handleLocationChange = (index, updated) => {
    setLocations((prev) => {
      const copy = [...prev];
      copy[index] = updated;
      return copy;
    });
  };

  const handleAddLocation = () => {
    setLocations((prev) => {
      const nextPriority = prev.length === 0 ? "PRIMARY" : prev.length === 1 ? "SECONDARY" : "OTHER";
      return [...prev, emptyLocation(nextPriority)];
    });
  };

  const handleRemoveLocation = (index) => {
    setLocations((prev) => reassignPriorities(prev.filter((_, i) => i !== index)));
  };

  const [locError, setLocError] = useState(null);

  const handleFormSubmit = (data) => {
    // Validate each location — required: facility_type, location_name, city, district, state, country, postcode
    for (let i = 0; i < locations.length; i++) {
      const loc = locations[i];
      const label = loc.location_priority === "PRIMARY" ? "primary" : loc.location_priority === "SECONDARY" ? "secondary" : `location ${i + 1}`;

      if (!loc.facility_type) {
        setLocError(`Please select a practice location type for your ${label} location.`);
        setOpen((p) => ({ ...p, location: true })); return;
      }
      if (loc.facility_type === "OTHER" && !loc.facility_type_other?.trim()) {
        setLocError(`Please specify the location type for your ${label} location.`);
        setOpen((p) => ({ ...p, location: true })); return;
      }
      if (!loc.location_name?.trim()) {
        setLocError(`Please enter a location name for your ${label} location.`);
        setOpen((p) => ({ ...p, location: true })); return;
      }
      if (!loc.city?.trim()) {
        setLocError(`Please add the city for your ${label} location.`);
        setOpen((p) => ({ ...p, location: true })); return;
      }
      if (!loc.district?.trim()) {
        setLocError(`Please add the district for your ${label} location.`);
        setOpen((p) => ({ ...p, location: true })); return;
      }
      if (!loc.state?.trim()) {
        setLocError(`Please add the state for your ${label} location.`);
        setOpen((p) => ({ ...p, location: true })); return;
      }
      if (!loc.country?.trim()) {
        setLocError(`Please add the country for your ${label} location.`);
        setOpen((p) => ({ ...p, location: true })); return;
      }
      if (!loc.postcode?.trim()) {
        setLocError(`Please add the pincode for your ${label} location.`);
        setOpen((p) => ({ ...p, location: true })); return;
      }
    }
    setLocError(null);
    onSubmit({ ...data, locations });
  };

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
            <img src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/images/dr_register.png`} alt="Doctor" width={240} height={280}
              className="object-contain mix-blend-multiply" />
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
          <AccordionSection icon={<User className="w-3.5 h-3.5 text-white" />} iconBg="bg-blue-500"
            title="Personal Information" subtitle="Let's start with your basic details"
            isOpen={open.personal} onToggle={() => toggle("personal")}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Label label="Full Name" error={errors.name?.message}>
                <div className="relative">
                  <User style={iconStyle} />
                  <input type="text" placeholder="Dr. Rahul Sharma" {...register("name")} className={inp(errors.name)} />
                </div>
                <p className="text-[9px] text-gray-400 mt-1">Enter your full name (at least 8 characters).</p>
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
          <AccordionSection icon={<Building2 className="w-3.5 h-3.5 text-white" />} iconBg="bg-violet-500"
            title="Professional Information" subtitle="Tell us about your practice"
            isOpen={open.professional} onToggle={() => toggle("professional")}>
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

          {/* ── Account Setup ── */}
          <AccordionSection icon={<Key className="w-3.5 h-3.5 text-white" />} iconBg="bg-amber-500"
            title="Account Setup" subtitle="Set up your DRX login credentials"
            isOpen={open.account} onToggle={() => toggle("account")}>

            {/* Username */}
            <div className="mb-3">
              <Label label="Username" error={errors.username?.message}>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <AtSign style={iconStyle} />
                    <input type="text" placeholder="rahul_sharma" {...register("username")} className={inp(errors.username)} />
                  </div>
                  <button type="button" onClick={handleGenerateUsername}
                    disabled={!nameValue}
                    className="flex items-center gap-1 px-3 py-2 text-[10px] font-semibold bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0">
                    <RefreshCw className="w-3 h-3" /> Generate
                  </button>
                </div>
              </Label>
              {usernameValue && !errors.username && (
                <p className="text-[10px] text-green-600 mt-1">Your login will be: <span className="font-bold">{usernameValue}</span></p>
              )}
              <p className="text-[9px] text-gray-400 mt-1">6-16 characters. Only letters, numbers, and underscores (_).</p>
              <p className="text-[9px] text-gray-400 mt-0.5 italic">Username and password are auto-generated. Please review and edit if you want.</p>
            </div>

            {/* Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Label label="Password" error={errors.password?.message}>
                <div className="relative">
                  <Key style={iconStyle} />
                  <input type={showPassword ? "text" : "password"} placeholder="Min 8 chars, Aa1@" {...register("password")}
                    className={`${inp(errors.password)} pr-9`} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff style={{ width: 14, height: 14 }} /> : <Eye style={{ width: 14, height: 14 }} />}
                  </button>
                </div>
              </Label>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label style={{ fontSize: "11px", fontWeight: 600, color: "#6b7280" }}>Confirm Password</label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" checked={sameAsPassword}
                      onChange={(e) => setSameAsPassword(e.target.checked)}
                      className="w-3 h-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="text-[9px] text-gray-400">Same as password</span>
                  </label>
                </div>
                <div className="relative">
                  <Key style={iconStyle} />
                  <input type={showConfirm ? "text" : "password"} placeholder="Re-enter password"
                    {...register("confirmPassword")}
                    disabled={sameAsPassword}
                    className={`${inp(errors.confirmPassword)} pr-9 ${sameAsPassword ? "opacity-60 cursor-not-allowed" : ""}`} />
                  {!sameAsPassword && (
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showConfirm ? <EyeOff style={{ width: 14, height: 14 }} /> : <Eye style={{ width: 14, height: 14 }} />}
                    </button>
                  )}
                </div>
                {errors.confirmPassword && <p style={{ fontSize: "9px", color: "#ef4444", marginTop: 4 }}>{errors.confirmPassword.message}</p>}
              </div>
            </div>

            <p className="text-[9px] text-gray-400 mt-2">
              Password must be 8-64 characters with at least one uppercase, one lowercase, one number, and one symbol. Only English letters, numbers, and standard symbols are allowed.
            </p>

            {usernameValue && passwordValue && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-[11px] font-bold text-amber-800 flex items-center gap-1.5 mb-1">
                  <Key className="w-3.5 h-3.5" /> Remember your DRX login credentials
                </p>
                <div className="space-y-1">
                  <p className="text-[11px] text-amber-700">
                    <span className="font-semibold">Username:</span> <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-amber-100">{usernameValue}</span>
                  </p>
                  <p className="text-[11px] text-amber-700">
                    <span className="font-semibold">Password:</span> <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-amber-100">{passwordValue}</span>
                  </p>
                </div>
                <p className="text-[9px] text-amber-500 mt-1.5">Please save these credentials. You will need them to log in to DRX.</p>
              </div>
            )}
          </AccordionSection>

          {/* ── Practice Locations ── */}
          <AccordionSection icon={<MapPin className="w-3.5 h-3.5 text-white" />} iconBg="bg-emerald-500"
            title="Practice Locations" subtitle="Add your hospital, clinic, or polyclinic locations"
            isOpen={open.location} onToggle={() => toggle("location")}>
            <div className="space-y-3">
              {locations.map((loc, i) => (
                <LocationCard
                  key={i}
                  location={loc}
                  index={i}
                  onChange={handleLocationChange}
                  onRemove={handleRemoveLocation}
                  canRemove={i !== 0}
                />
              ))}

              {/* Add another location button */}
              <button type="button" onClick={handleAddLocation}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-blue-200 text-blue-600 text-xs font-semibold hover:bg-blue-50 transition-colors">
                <Plus className="w-3.5 h-3.5" /> Add Another Location
              </button>

              <p className="text-[9px] text-gray-400 text-center">
                Primary is required. Secondary is optional — remove it if you don&apos;t have one. Add more if needed.
              </p>
            </div>
          </AccordionSection>
        </form>

        {/* Submit */}
        <div className="flex-shrink-0 px-4 md:px-8 py-3 bg-white/80 backdrop-blur border-t border-gray-100">
          {(submitError || locError) && (
            <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-[11px] text-red-600 font-medium text-center">{submitError || locError}</p>
            </div>
          )}
          <motion.button
            whileHover={{ scale: 1.005 }} whileTap={{ scale: 0.995 }}
            type="button" onClick={handleSubmit(handleFormSubmit)} disabled={isSubmitting || parentSubmitting}
            className="w-full py-3 rounded-2xl text-white font-bold text-sm flex flex-col items-center gap-0.5 disabled:opacity-50 shadow-lg shadow-blue-200/50"
            style={{ background: "linear-gradient(135deg,#3b82f6,#6366f1)" }}>
            {(isSubmitting || parentSubmitting) ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4" /> Review &amp; Continue
                </div>
                <span className="text-[9px] font-normal opacity-70">Review your details before submitting</span>
              </>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}

function AccordionSection({ icon, iconBg, title, subtitle, isOpen, onToggle, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button type="button" onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-xl ${iconBg} flex items-center justify-center shadow-sm`}>{icon}</div>
          <div className="text-left">
            <p className="text-sm font-bold text-gray-800 leading-none">{title}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{subtitle}</p>
          </div>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.25 }} className="flex-shrink-0">
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div key="content" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} style={{ overflow: "hidden" }}>
            <div className="px-4 py-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Label({ label, error, children }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#6b7280", marginBottom: 6 }}>{label}</label>
      {children}
      {error && <p style={{ fontSize: "9px", color: "#ef4444", marginTop: 4 }}>{error}</p>}
    </div>
  );
}
