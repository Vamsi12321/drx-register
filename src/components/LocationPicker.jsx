"use client";

import { useState } from "react";
import { MapPin, Navigation, Search } from "lucide-react";
import dynamic from "next/dynamic";
import SearchLocation from "./SearchLocation";
import CurrentLocationButton from "./CurrentLocationButton";

const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-44 bg-gray-100 rounded-xl animate-pulse flex items-center justify-center">
      <MapPin className="w-5 h-5 text-gray-300" />
    </div>
  ),
});

export default function LocationPicker({ onLocationChange, compact = false }) {
  const [position, setPosition] = useState(null);
  const [activeTab, setActiveTab] = useState("search");
  const [selected, setSelected] = useState(null);

  const handlePositionChange = (lat, lng, locationData) => {
    setPosition([lat, lng]);
    setSelected(locationData);
    onLocationChange(locationData);
  };

  return (
    <div className="flex flex-col gap-3">

      {/* Tab toggles */}
      <div className="flex gap-2">
        <button type="button" onClick={() => setActiveTab("current")}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
            activeTab === "current"
              ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
              : "bg-blue-50 text-blue-600 hover:bg-blue-100"
          }`}>
          <Navigation className="w-3 h-3" /> Use Current Location
        </button>
        <button type="button" onClick={() => setActiveTab("search")}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
            activeTab === "search"
              ? "bg-gray-700 text-white shadow-sm"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}>
          <Search className="w-3 h-3" /> Search Location
        </button>
      </div>

      {/* Current location button */}
      {activeTab === "current" && (
        <CurrentLocationButton onLocationDetected={handlePositionChange} />
      )}

      {/* Search */}
      {activeTab === "search" && (
        <SearchLocation onLocationSelected={handlePositionChange} />
      )}

      {/* Map */}
      <div className="h-44 rounded-xl overflow-hidden border border-gray-100 shadow-sm">
        <LeafletMap position={position} onPositionChange={handlePositionChange} />
      </div>

      {/* Selected address chip */}
      {selected?.address && (
        <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100">
          <MapPin className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-blue-800 leading-tight truncate">
              {selected.address.split(",").slice(0, 2).join(",")}
            </p>
            <p className="text-[10px] text-blue-500 mt-0.5">
              {[selected.city, selected.state, selected.country].filter(Boolean).join(", ")}
            </p>
          </div>
          <button type="button"
            onClick={() => { setPosition(null); setSelected(null); onLocationChange({ latitude:"",longitude:"",address:"",city:"",state:"",country:"" }); }}
            className="text-[10px] text-blue-500 font-bold hover:text-blue-700 flex-shrink-0 mt-0.5">
            Change
          </button>
        </div>
      )}
    </div>
  );
}
