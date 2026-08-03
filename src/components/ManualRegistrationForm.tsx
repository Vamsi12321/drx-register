"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { User, Mail, Phone, Building2, Send } from "lucide-react";
import { doctorRegistrationSchema, type DoctorRegistrationFormData } from "@/lib/validation";
import type { DoctorRegistrationData, LocationData } from "@/lib/types";
import LocationPicker from "./LocationPicker";
import SpecializationSelect from "./SpecializationSelect";
import { useState } from "react";

interface ManualRegistrationFormProps {
  prefillData?: Partial<DoctorRegistrationData>;
  onSubmit: (data: DoctorRegistrationData) => void;
}

export default function ManualRegistrationForm({ prefillData, onSubmit }: ManualRegistrationFormProps) {
  const [locationData, setLocationData] = useState<LocationData>({
    latitude: "",
    longitude: "",
    address: "",
    city: "",
    state: "",
    country: "",
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DoctorRegistrationFormData>({
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

  const handleLocationChange = (location: LocationData) => {
    setLocationData(location);
  };

  const handleFormSubmit = (data: DoctorRegistrationFormData) => {
    const finalData: DoctorRegistrationData = {
      ...data,
      location: locationData,
    };
    onSubmit(finalData);
  };

  // Text input fields (all except department)
  const inputFields = [
    { name: "name" as const, label: "Full Name", icon: User, placeholder: "Dr. Rahul Sharma", type: "text" },
    { name: "email" as const, label: "Email Address", icon: Mail, placeholder: "rahul@gmail.com", type: "email" },
    { name: "phone" as const, label: "Phone Number", icon: Phone, placeholder: "9876543210", type: "tel" },
    { name: "hospital" as const, label: "Hospital / Clinic", icon: Building2, placeholder: "Apollo Hospital", type: "text" },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {prefillData ? "Review & Edit Details" : "Registration Form"}
        </h2>
        <p className="text-sm text-gray-500">
          {prefillData
            ? "Review AI-extracted data and make changes if needed"
            : "Fill in your details to register with DRX"}
        </p>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">

          {/* Text inputs */}
          {inputFields.map((field, index) => (
            <motion.div
              key={field.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {field.label}
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <field.icon className="w-4 h-4" />
                </div>
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  {...register(field.name)}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                    errors[field.name]
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-200 focus:ring-drx-500 focus:border-drx-500"
                  } text-gray-900 text-sm placeholder:text-gray-400 focus:ring-2 focus:outline-none transition-all`}
                />
              </div>
              {errors[field.name] && (
                <p className="mt-1 text-xs text-red-500">{errors[field.name]?.message}</p>
              )}
            </motion.div>
          ))}

          {/* Specialization dropdown */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Department / Specialization
            </label>
            <Controller
              name="department"
              control={control}
              render={({ field }) => (
                <SpecializationSelect
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.department?.message}
                />
              )}
            />
            {errors.department && (
              <p className="mt-1 text-xs text-red-500">{errors.department.message}</p>
            )}
            {/* Show AI-detected badge if prefilled */}
            {prefillData?.department && (
              <p className="mt-1 text-xs text-drx-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-drx-500 inline-block" />
                AI detected: <span className="font-medium">{prefillData.department}</span>
              </p>
            )}
          </motion.div>
        </div>

        {/* Location Picker */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <LocationPicker onLocationChange={handleLocationChange} />
        </motion.div>

        {/* Location summary */}
        {locationData.address && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 bg-green-50 rounded-xl border border-green-100"
          >
            <p className="text-sm font-medium text-green-800 mb-1">Selected Location</p>
            <p className="text-xs text-green-700">{locationData.address}</p>
            <p className="text-xs text-green-600 mt-1">
              {[locationData.city, locationData.state, locationData.country].filter(Boolean).join(", ")}
            </p>
            <p className="text-xs text-green-500 mt-1">
              ({locationData.latitude}, {locationData.longitude})
            </p>
          </motion.div>
        )}

        {/* Submit */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-drx-600 to-drx-700 text-white rounded-xl font-semibold hover:from-drx-700 hover:to-drx-800 transition-all shadow-lg shadow-drx-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-5 h-5" />
          Submit Registration
        </motion.button>
      </form>
    </div>
  );
}
