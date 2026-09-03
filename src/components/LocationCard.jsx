"use client";

import { useState } from "react";
import { MapPin, Navigation, Search, Trash2, Building2, ChevronDown } from "lucide-react";
import dynamic from "next/dynamic";
import SearchLocation from "./SearchLocation";
import CurrentLocationButton from "./CurrentLocationButton";

const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-blue-50 rounded-xl animate-pulse" />,
});

const FACILITY_TYPES = [
  { value: "HOSPITAL", label: "Hospital" },
  { value: "CLINIC", label: "Clinic" },
  { value: "POLYCLINIC", label: "Polyclinic" },
  { value: "MEDICAL_CENTER", label: "Medical Center" },
  { value: "INSTITUTION OR MEDICAL COLLEGE", label: "Institution / Medical College" },
  { value: "OTHER", label: "Other" },
];

const PRIORITY_STYLES = {
  PRIMARY: { bg: "bg-blue-600", text: "text-white", label: "Primary" },
  SECONDARY: { bg: "bg-violet-500", text: "text-white", label: "Secondary" },
  OTHER: { bg: "bg-gray-500", text: "text-white", label: "Other" },
};

export default function LocationCard({ location, index, onChange, onRemove, canRemove }) {
  const [locTab, setLocTab] = useState("search");

  const priority = location.location_priority;
  const style = PRIORITY_STYLES[priority] || PRIORITY_STYLES.OTHER;

  const update = (field, value) => {
    onChange(index, { ...location, [field]: value });
  };

  const handleMapChange = (lat, lng, data, sourceType) => {
    onChange(index, {
      ...location,
      latitude: data.latitude || "",
      longitude: data.longitude || "",
      address: data.address || "",
      area: data.area || "",
      city: data.city || "",
      district: data.district || "",
      state: data.state || "",
      country: data.country || "",
      postcode: data.postcode || "",
      location_source: sourceType,
      _mapPos: [lat, lng],
    });
  };

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden bg-gray-50/50">
      {/* Card header */}
      <div className="flex items-center justify-between px-3 py-2.5 bg-white border-b border-gray-100">
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-emerald-500" />
          <span className={`text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}>
            {style.label}
          </span>
          <span className="text-[11px] font-semibold text-gray-600">Location {index + 1}</span>
        </div>
        {canRemove && (
          <button type="button" onClick={() => onRemove(index)}
            className="text-gray-400 hover:text-red-500 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="p-3 space-y-3">
        {/* Facility type + name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Practice Location Type <span className="text-red-400">*</span></label>
            <div className="relative">
              <Building2 style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", width: 12, height: 12, color: "#93c5fd", pointerEvents: "none" }} />
              <select value={location.facility_type} onChange={(e) => update("facility_type", e.target.value)}
                className="w-full appearance-none pl-8 pr-8 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none">
                <option value="">Select type</option>
                {FACILITY_TYPES.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
              <ChevronDown style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", width: 12, height: 12, color: "#9ca3af", pointerEvents: "none" }} />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Practice Location Name <span className="text-red-400">*</span></label>
            <input type="text" placeholder="e.g. Apollo Hospital"
              value={location.location_name}
              onChange={(e) => update("location_name", e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none" />
          </div>
        </div>

        {/* facility_type_other — only when OTHER */}
        {location.facility_type === "OTHER" && (
          <div>
            <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Specify Location Type</label>
            <input type="text" placeholder="e.g. Diagnostic Lab"
              value={location.facility_type_other || ""}
              onChange={(e) => update("facility_type_other", e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none" />
          </div>
        )}

        {/* Location picker tabs */}
        <div className="flex flex-wrap gap-1.5">
          <button type="button" onClick={() => setLocTab("current")}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[9px] font-semibold transition-all ${locTab === "current" ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-600 hover:bg-blue-100"}`}>
            <Navigation className="w-2.5 h-2.5" /> Current Location
          </button>
          <button type="button" onClick={() => setLocTab("search")}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[9px] font-semibold transition-all ${locTab === "search" ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
            <Search className="w-2.5 h-2.5" /> Search
          </button>
        </div>

        {/* Helper note */}
        <p className="text-[9px] text-gray-400 italic">
          Tip: Use Current Location or Search to auto-fill the address, city, state &amp; pincode below — no need to type them manually.
        </p>

        {/* Current / Search controls + map */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            {locTab === "current" && (
              <CurrentLocationButton onLocationDetected={(lat, lng, data) => handleMapChange(lat, lng, data, "CURRENT_LOCATION")} />
            )}
            {locTab === "search" && (
              <SearchLocation onLocationSelected={(lat, lng, data) => handleMapChange(lat, lng, data, "MAP_SEARCH")} />
            )}
            {location.location_source && (
              <p className="text-[9px] text-blue-500 flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5" />
                {location.location_source === "CURRENT_LOCATION" ? "Detected from GPS" : location.location_source === "MAP_SEARCH" ? "Selected from search/map" : "Entered manually"} — edit below if needed
              </p>
            )}
          </div>
          <div className="h-32 rounded-xl overflow-hidden border border-gray-200">
            <LeafletMap position={location._mapPos || null}
              onPositionChange={(lat, lng, data) => handleMapChange(lat, lng, data, "MAP_SEARCH")} />
          </div>
        </div>

        {/* Editable address fields — always visible, pre-filled from map/search */}
        <div className="grid grid-cols-1 gap-2 pt-1">
          <div>
            <label className="text-[9px] font-semibold text-gray-500 mb-1 block">Address <span className="text-gray-300">(optional)</span></label>
            <input type="text" placeholder="Full address"
              value={location.address}
              onChange={(e) => onChange(index, { ...location, address: e.target.value, location_source: location.location_source || "MANUAL" })}
              className="w-full px-2.5 py-1.5 text-[11px] rounded-lg border border-gray-200 bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-100 outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] font-semibold text-gray-500 mb-1 block">Area <span className="text-gray-300">(optional)</span></label>
              <input type="text" placeholder="Locality / Area" value={location.area || ""}
                onChange={(e) => update("area", e.target.value)}
                className="w-full px-2.5 py-1.5 text-[11px] rounded-lg border border-gray-200 bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-100 outline-none" />
            </div>
            <div>
              <label className="text-[9px] font-semibold text-gray-500 mb-1 block">City <span className="text-red-400">*</span></label>
              <input type="text" placeholder="City" value={location.city}
                onChange={(e) => update("city", e.target.value)}
                className="w-full px-2.5 py-1.5 text-[11px] rounded-lg border border-gray-200 bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-100 outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] font-semibold text-gray-500 mb-1 block">District <span className="text-red-400">*</span></label>
              <input type="text" placeholder="District" value={location.district || ""}
                onChange={(e) => update("district", e.target.value)}
                className="w-full px-2.5 py-1.5 text-[11px] rounded-lg border border-gray-200 bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-100 outline-none" />
            </div>
            <div>
              <label className="text-[9px] font-semibold text-gray-500 mb-1 block">State <span className="text-red-400">*</span></label>
              <input type="text" placeholder="State" value={location.state}
                onChange={(e) => update("state", e.target.value)}
                className="w-full px-2.5 py-1.5 text-[11px] rounded-lg border border-gray-200 bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-100 outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] font-semibold text-gray-500 mb-1 block">Country <span className="text-red-400">*</span></label>
              <input type="text" placeholder="Country" value={location.country}
                onChange={(e) => update("country", e.target.value)}
                className="w-full px-2.5 py-1.5 text-[11px] rounded-lg border border-gray-200 bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-100 outline-none" />
            </div>
            <div>
              <label className="text-[9px] font-semibold text-gray-500 mb-1 block">Pincode <span className="text-red-400">*</span></label>
              <input type="text" placeholder="Pincode" value={location.postcode}
                onChange={(e) => update("postcode", e.target.value)}
                className="w-full px-2.5 py-1.5 text-[11px] rounded-lg border border-gray-200 bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-100 outline-none" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
