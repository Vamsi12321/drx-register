"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Navigation, Search } from "lucide-react";
import type { LocationData } from "@/lib/types";
import dynamic from "next/dynamic";
import SearchLocation from "./SearchLocation";
import CurrentLocationButton from "./CurrentLocationButton";

// Dynamic import of LeafletMap (no SSR - Leaflet requires window)
const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 bg-gray-100 rounded-xl animate-pulse flex items-center justify-center">
      <MapPin className="w-8 h-8 text-gray-300" />
    </div>
  ),
});

interface LocationPickerProps {
  onLocationChange: (location: LocationData) => void;
}

export default function LocationPicker({ onLocationChange }: LocationPickerProps) {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [activeTab, setActiveTab] = useState<"current" | "search">("search");

  const handlePositionChange = (lat: number, lng: number, locationData: LocationData) => {
    setPosition([lat, lng]);
    onLocationChange(locationData);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-5 h-5 text-drx-600" />
          <h3 className="font-semibold text-gray-900">Location</h3>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("current")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "current"
                ? "bg-drx-100 text-drx-700"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            Use Current Location
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("search")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "search"
                ? "bg-drx-100 text-drx-700"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            Search Location
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {activeTab === "current" && (
          <CurrentLocationButton onLocationDetected={handlePositionChange} />
        )}

        {activeTab === "search" && (
          <SearchLocation onLocationSelected={handlePositionChange} />
        )}

        {/* Map */}
        <div className="h-64 rounded-xl overflow-hidden border border-gray-200">
          <LeafletMap
            position={position}
            onPositionChange={handlePositionChange}
          />
        </div>
      </div>
    </div>
  );
}
