"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Stethoscope, ChevronDown, Search, X, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SpecializationSelectProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

interface SpecializationData {
  top: string[];
  ordered: string[];
  total: number;
}

export default function SpecializationSelect({
  value,
  onChange,
  error,
  disabled = false,
}: SpecializationSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [data, setData] = useState<SpecializationData | null>(null);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Fetch specializations on mount
  useEffect(() => {
    fetch("/api/specializations")
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {
        // Minimal fallback
        setData({
          top: ["General Physician", "Cardiology", "Dermatology", "Pediatrics", "Orthopedic Surgery",
            "Obstetrics & Gynecology", "Neurology", "Psychiatry", "Ophthalmology", "ENT"],
          ordered: ["General Physician", "Cardiology", "Dermatology", "Pediatrics", "Orthopedic Surgery",
            "Obstetrics & Gynecology", "Neurology", "Psychiatry", "Ophthalmology", "ENT"],
          total: 10,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Focus search when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleSelect = useCallback((spec: string) => {
    onChange(spec);
    setIsOpen(false);
    setSearch("");
  }, [onChange]);

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setSearch("");
  };

  // Filter based on search
  const filtered = data
    ? search.trim().length > 0
      ? data.ordered.filter((s) =>
          s.toLowerCase().includes(search.toLowerCase())
        )
      : data.ordered
    : [];

  const topSet = new Set(data?.top || []);

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        disabled={disabled || loading}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center gap-2 pl-10 pr-4 py-3 rounded-xl border text-left text-sm transition-all focus:outline-none focus:ring-2
          ${error
            ? "border-red-300 focus:ring-red-500"
            : isOpen
            ? "border-drx-500 ring-2 ring-drx-500"
            : "border-gray-200 hover:border-drx-300 focus:ring-drx-500"
          }
          ${disabled || loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          bg-white`}
      >
        {/* Left icon */}
        <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />

        {/* Selected value or placeholder */}
        <span className={`flex-1 truncate ${value ? "text-gray-900 font-medium" : "text-gray-400"}`}>
          {loading ? "Loading specializations..." : value || "Select specialization"}
        </span>

        {/* Clear button */}
        {value && !disabled && (
          <X
            onClick={handleClear}
            className="w-4 h-4 text-gray-400 hover:text-gray-600 flex-shrink-0"
          />
        )}

        <ChevronDown
          className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 left-0 right-0 mt-1 bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden"
          >
            {/* Search box */}
            <div className="p-2 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search specialization..."
                  className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-drx-500 focus:border-drx-500"
                />
              </div>
            </div>

            {/* List */}
            <div className="max-h-60 overflow-y-auto">
              {/* Section label */}
              {!search && (
                <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide bg-gray-50 flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  Popular
                </div>
              )}

              {filtered.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-gray-400">
                  No specialization found
                </div>
              ) : (
                filtered.map((spec, idx) => {
                  const isTop = topSet.has(spec) && !search;
                  const isSelected = value === spec;
                  const showRestLabel =
                    !search &&
                    idx === (data?.top.length ?? 0) &&
                    data?.ordered &&
                    data.ordered.length > (data?.top.length ?? 0);

                  return (
                    <div key={spec}>
                      {showRestLabel && (
                        <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide bg-gray-50">
                          All Specializations
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => handleSelect(spec)}
                        className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 transition-colors
                          ${isSelected
                            ? "bg-drx-50 text-drx-700 font-semibold"
                            : "text-gray-700 hover:bg-gray-50"
                          }`}
                      >
                        {isTop && !search && (
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400 flex-shrink-0" />
                        )}
                        <span>{spec}</span>
                        {isSelected && (
                          <svg className="ml-auto w-4 h-4 text-drx-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-3 py-2 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-400">
                {search ? `${filtered.length} results` : `${data?.total || 0} specializations`}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
