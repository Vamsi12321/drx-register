"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { reverseGeocode } from "@/lib/api";

const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

function MapUpdater({ position }) {
  const map = useMap();
  useEffect(() => { if (position) map.setView(position, 15, { animate: true }); }, [map, position]);
  return null;
}

function MapClickHandler({ onPositionChange }) {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      try {
        const result = await reverseGeocode(lat, lng);
        onPositionChange(lat, lng, {
          latitude: lat.toFixed(6), longitude: lng.toFixed(6),
          address: result.display_name || "",
          city: result.address?.city || result.address?.town || result.address?.village || "",
          state: result.address?.state || "", country: result.address?.country || "",
        });
      } catch {
        onPositionChange(lat, lng, { latitude: lat.toFixed(6), longitude: lng.toFixed(6), address: "", city: "", state: "", country: "" });
      }
    },
  });
  return null;
}

function DraggableMarker({ position, onPositionChange }) {
  const markerRef = useRef(null);
  const eventHandlers = {
    async dragend() {
      const marker = markerRef.current;
      if (marker) {
        const { lat, lng } = marker.getLatLng();
        try {
          const result = await reverseGeocode(lat, lng);
          onPositionChange(lat, lng, {
            latitude: lat.toFixed(6), longitude: lng.toFixed(6),
            address: result.display_name || "",
            city: result.address?.city || result.address?.town || result.address?.village || "",
            state: result.address?.state || "", country: result.address?.country || "",
          });
        } catch {
          onPositionChange(lat, lng, { latitude: lat.toFixed(6), longitude: lng.toFixed(6), address: "", city: "", state: "", country: "" });
        }
      }
    },
  };
  return <Marker position={position} icon={icon} draggable={true} ref={markerRef} eventHandlers={eventHandlers} />;
}

export default function LeafletMap({ position, onPositionChange }) {
  const defaultCenter = [17.385, 78.4867];
  const [isMounted, setIsMounted] = useState(false);
  const mapRef = useRef(null);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      // On unmount, remove the map instance to prevent "already initialized" on remount
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  if (!isMounted) {
    return <div className="h-full w-full bg-gray-100 rounded-xl animate-pulse" />;
  }

  return (
    <MapContainer
      center={position || defaultCenter}
      zoom={position ? 15 : 5}
      scrollWheelZoom={true}
      className="h-full w-full"
      ref={mapRef}
    >
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <MapUpdater position={position} />
      <MapClickHandler onPositionChange={onPositionChange} />
      {position && <DraggableMarker position={position} onPositionChange={onPositionChange} />}
    </MapContainer>
  );
}
