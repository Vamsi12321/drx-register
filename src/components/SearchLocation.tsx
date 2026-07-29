"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Search, MapPin, Loader2 } from "lucide-react";
import { searchLocation, type NominatimResult } from "@/lib/api";
import type { LocationData } from "@/lib/types";

interface SearchLocationProps {
  onLocationSelected: (lat: number, lng: number, location: LocationData) => void;
}

export default function SearchLocation({ onLocationSelected }: SearchLocationProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-search as user types (debounced)
  const handleInputChange = (value: string) => {
    setQuery(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (value.trim().length < 3) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      setShowDropdown(true);
      try {
        const data = await searchLocation(value);
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);
  };

  const handleSelect = (result: NominatimResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);

    const locationData: LocationData = {
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6),
      address: result.display_name,
      city: result.address?.city || result.address?.town || result.address?.village || "",
      state: result.address?.state || "",
      country: result.address?.country || "",
    };

    onLocationSelected(lat, lng, locationData);
    setQuery(result.display_name.split(",")[0]);
    setResults([]);
    setShowDropdown(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (query.trim().length >= 2) {
        setIsSearching(true);
        setShowDropdown(true);
        searchLocation(query)
          .then((data) => setResults(data))
          .catch(() => setResults([]))
          .finally(() => setIsSearching(false));
      }
    }
  };

  return (
    <div className="space-y-2" ref={containerRef}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setShowDropdown(true)}
          placeholder="Search hospital, clinic, or address..."
          className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-drx-500 focus:border-drx-500 focus:outline-none"
        />
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-drx-500 animate-spin" />
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {showDropdown && results.length > 0 && (
        <div className="border border-gray-200 rounded-xl overflow-hidden max-h-52 overflow-y-auto shadow-lg bg-white z-10 relative">
          {results.map((result) => (
            <button
              key={result.place_id}
              type="button"
              onClick={() => handleSelect(result)}
              className="w-full text-left px-4 py-3 hover:bg-drx-50 border-b border-gray-100 last:border-b-0 transition-colors"
            >
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-drx-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700 line-clamp-2">
                  {result.display_name}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results */}
      {showDropdown && !isSearching && query.length >= 3 && results.length === 0 && (
        <p className="text-xs text-gray-500 px-1">
          No results found. Try a different search term.
        </p>
      )}

      {/* Quick Suggestions */}
      {!showDropdown && !query && (
        <div className="flex flex-wrap gap-1.5">
          {["Apollo Hospital Hyderabad", "AIG Hospital", "KIMS Vizag", "Fortis Hospital", "AIIMS Delhi"].map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => {
                handleInputChange(suggestion);
                setQuery(suggestion);
              }}
              className="px-2.5 py-1 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-drx-50 hover:text-drx-700 transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
