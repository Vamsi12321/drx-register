"use client";

import { useState } from "react";
import { Navigation, Loader2 } from "lucide-react";
import { reverseGeocode } from "@/lib/api";
import type { LocationData } from "@/lib/types";

interface CurrentLocationButtonProps {
  onLocationDetected: (lat: number, lng: number, location: LocationData) => void;
}

export default function CurrentLocationButton({ onLocationDetected }: CurrentLocationButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetLocation = async () => {
    setIsLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const result = await reverseGeocode(latitude, longitude);
          const locationData: LocationData = {
            latitude: latitude.toFixed(6),
            longitude: longitude.toFixed(6),
            address: result.display_name || "",
            city: result.address?.city || result.address?.town || result.address?.village || "",
            state: result.address?.state || "",
            country: result.address?.country || "",
          };
          onLocationDetected(latitude, longitude, locationData);
        } catch {
          // Even if reverse geocoding fails, provide coords
          onLocationDetected(latitude, longitude, {
            latitude: latitude.toFixed(6),
            longitude: longitude.toFixed(6),
            address: "",
            city: "",
            state: "",
            country: "",
          });
        }
        setIsLoading(false);
      },
      (err) => {
        setError(
          err.code === 1
            ? "Location permission denied. Please enable it in your browser settings."
            : "Could not detect your location. Please try again."
        );
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleGetLocation}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-drx-50 border border-drx-200 text-drx-700 rounded-xl hover:bg-drx-100 transition-colors text-sm font-medium disabled:opacity-50"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Navigation className="w-4 h-4" />
        )}
        {isLoading ? "Detecting location..." : "Detect My Current Location"}
      </button>
      {error && (
        <p className="mt-2 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
