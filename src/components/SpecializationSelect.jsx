"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Stethoscope, ChevronDown, X, Search, CheckCircle2 } from "lucide-react";

const TOP_6 = [
  "General Physician",
  "Cardiology",
  "Dermatology",
  "Pediatrics",
  "Orthopedic Surgery",
  "Obstetrics & Gynecology",
];

export default function SpecializationSelect({ value, onChange, error, disabled = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [allSpecs, setAllSpecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const [isCustom, setIsCustom] = useState(false); // "Other" free-text mode

  const triggerRef = useRef(null);
  const searchRef = useRef(null);
  const customRef = useRef(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/specializations`)
      .then((r) => r.json())
      .then((d) => setAllSpecs(d.ordered || []))
      .catch(() => setAllSpecs(TOP_6))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target) &&
        !document.getElementById("spec-portal")?.contains(e.target)
      ) {
        setIsOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Update position on scroll/resize so dropdown follows the trigger
  useEffect(() => {
    if (!isOpen) return;
    const update = () => {
      if (triggerRef.current) {
        const r = triggerRef.current.getBoundingClientRect();
        setPos({ top: r.bottom + 4, left: r.left, width: r.width });
      }
    };
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) setTimeout(() => searchRef.current?.focus(), 60);
  }, [isOpen]);

  const handleOpen = () => {
    if (disabled || loading) return;
    if (!isOpen && triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      // Use fixed positioning — no scroll offset needed
      setPos({ top: r.bottom + 4, left: r.left, width: r.width });
    }
    setIsOpen((p) => !p);
  };

  const handleSelect = useCallback((spec) => {
    onChange(spec);
    setIsOpen(false);
    setSearch("");
    setIsCustom(false);
  }, [onChange]);

  // Switch to custom free-text mode
  const handleChooseOther = () => {
    onChange("");
    setIsCustom(true);
    setIsOpen(false);
    setSearch("");
    setTimeout(() => customRef.current?.focus(), 60);
  };

  // When searching: filter all specs. When not: show only top 6 as chips
  const searchResults = search.trim().length > 0
    ? allSpecs.filter((s) => s.toLowerCase().includes(search.toLowerCase())).slice(0, 8)
    : [];

  return (
    <>
      {/* Trigger — custom text input OR dropdown button */}
      <div ref={triggerRef}>
        {isCustom ? (
          <div style={{ position: "relative" }}>
            <Stethoscope style={{ position:"absolute", left:9, top:"50%", transform:"translateY(-50%)", width:13, height:13, color:"#93c5fd" }} />
            <input
              ref={customRef}
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Enter your specialization"
              className={`w-full pl-8 pr-8 py-2 rounded-xl border text-xs outline-none transition-all bg-white
                ${error ? "border-red-300" : "border-blue-400 ring-2 ring-blue-100"}`}
            />
            <button type="button"
              onClick={() => { setIsCustom(false); onChange(""); }}
              title="Back to list"
              style={{ position:"absolute", right:9, top:"50%", transform:"translateY(-50%)" }}>
              <X style={{ width:13, height:13, color:"#9ca3af" }} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={disabled || loading}
            onClick={handleOpen}
            style={{ position: "relative" }}
            className={`w-full flex items-center gap-2 pl-8 pr-3 py-2 rounded-xl border text-left text-xs transition-all outline-none bg-gray-50 hover:bg-white
              ${error ? "border-red-300" : isOpen ? "border-blue-400 ring-2 ring-blue-100 bg-white" : "border-gray-200"}
              ${disabled || loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <Stethoscope style={{ position:"absolute", left:9, top:"50%", transform:"translateY(-50%)", width:13, height:13, color:"#93c5fd" }} />
            <span className={`flex-1 truncate ${value ? "text-gray-800 font-medium" : "text-gray-400"}`}>
              {loading ? "Loading..." : value || "Select specialization"}
            </span>
            {value && (
              <X onClick={(e) => { e.stopPropagation(); onChange(""); }} style={{ width:13, height:13, color:"#9ca3af" }} />
            )}
            <ChevronDown style={{ width:13, height:13, color:"#9ca3af", transition:"transform 0.2s", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }} />
          </button>
        )}
      </div>

      {/* Portal dropdown */}
      {isOpen && typeof document !== "undefined" && createPortal(
        <div
          id="spec-portal"
          style={{
            position: "fixed",
            top: pos.top,
            left: pos.left,
            width: Math.max(pos.width, 280),
            zIndex: 99999,
          }}
        >
          <div style={{
            background: "#fff",
            borderRadius: 14,
            border: "1px solid #e5e7eb",
            boxShadow: "0 16px 48px rgba(0,0,0,0.14), 0 2px 8px rgba(59,130,246,0.06)",
            overflow: "hidden",
            padding: 12,
          }}>

            {/* Search box */}
            <div style={{ position: "relative", marginBottom: 10 }}>
              <Search style={{ position:"absolute", left:9, top:"50%", transform:"translateY(-50%)", width:12, height:12, color:"#9ca3af" }} />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search specialization..."
                style={{
                  width: "100%",
                  paddingLeft: 28,
                  paddingRight: 10,
                  paddingTop: 7,
                  paddingBottom: 7,
                  fontSize: 11,
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  outline: "none",
                  background: "#f9fafb",
                  color: "#374151",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => { e.target.style.borderColor = "#3b82f6"; e.target.style.boxShadow = "0 0 0 2px #dbeafe"; }}
                onBlur={(e) => { e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            {/* No search — show top 6 chips */}
            {!search.trim() && (
              <>
                <p style={{ fontSize: 9, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                  Popular Specializations
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {TOP_6.map((spec) => {
                    const isSelected = value === spec;
                    return (
                      <button
                        key={spec}
                        type="button"
                        onClick={() => handleSelect(spec)}
                        style={{
                          padding: "5px 10px",
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: isSelected ? 700 : 500,
                          border: `1.5px solid ${isSelected ? "#3b82f6" : "#e5e7eb"}`,
                          background: isSelected ? "#eff6ff" : "#f9fafb",
                          color: isSelected ? "#2563eb" : "#4b5563",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          transition: "all 0.15s",
                        }}
                        onMouseEnter={(e) => { if (!isSelected) { e.currentTarget.style.borderColor = "#93c5fd"; e.currentTarget.style.color = "#2563eb"; e.currentTarget.style.background = "#f0f9ff"; }}}
                        onMouseLeave={(e) => { if (!isSelected) { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.color = "#4b5563"; e.currentTarget.style.background = "#f9fafb"; }}}
                      >
                        {isSelected && <CheckCircle2 style={{ width: 10, height: 10, color: "#3b82f6" }} />}
                        {spec}
                      </button>
                    );
                  })}
                </div>
                <p style={{ fontSize: 9, color: "#9ca3af", marginTop: 8 }}>
                  Type to search from {allSpecs.length} specializations
                </p>

                {/* Other — enter manually */}
                <button type="button" onClick={handleChooseOther}
                  style={{
                    marginTop: 10, width: "100%", padding: "8px 10px", borderRadius: 8,
                    border: "1px dashed #93c5fd", background: "#f0f9ff", color: "#2563eb",
                    fontSize: 11, fontWeight: 600, cursor: "pointer", textAlign: "left",
                  }}>
                  + Other — enter your specialization manually
                </button>
              </>
            )}

            {/* Search results */}
            {search.trim() && (
              <>
                {searchResults.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "12px 0" }}>
                    <p style={{ fontSize: 11, color: "#9ca3af", marginBottom: 8 }}>No results found</p>
                    <button type="button" onClick={handleChooseOther}
                      style={{
                        padding: "8px 12px", borderRadius: 8, border: "1px dashed #93c5fd",
                        background: "#f0f9ff", color: "#2563eb", fontSize: 11, fontWeight: 600, cursor: "pointer",
                      }}>
                      + Enter &quot;{search}&quot; manually
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {searchResults.map((spec) => {
                      const isSelected = value === spec;
                      return (
                        <button
                          key={spec}
                          type="button"
                          onClick={() => handleSelect(spec)}
                          style={{
                            width: "100%",
                            textAlign: "left",
                            padding: "7px 10px",
                            fontSize: 11,
                            borderRadius: 8,
                            border: "none",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            cursor: "pointer",
                            background: isSelected ? "#eff6ff" : "transparent",
                            color: isSelected ? "#2563eb" : "#374151",
                            fontWeight: isSelected ? 600 : 400,
                          }}
                          onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = "#f9fafb"; }}
                          onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
                        >
                          <span>{spec}</span>
                          {isSelected && <CheckCircle2 style={{ width: 12, height: 12, color: "#3b82f6" }} />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
