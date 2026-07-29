"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { reverseGeocode } from "@/lib/api";
import type { LocationData } from "@/lib/types";

// Fix Leaflet default icon issue with Next.js
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface LeafletMapProps {
  position: [number, number] | null;
  onPositionChange: (lat: number, lng: number, location: LocationData) => void;
}

function MapUpdater({ position }: { position: [number, number] | null }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.setView(position, 15, { animate: true });
    }
  }, [map, position]);

  return null;
}

function MapClickHandler({
  onPositionChange,
}: {
  onPositionChange: (lat: number, lng: number, location: LocationData) => void;
}) {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      try {
        const result = await reverseGeocode(lat, lng);
        const locationData: LocationData = {
          latitude: lat.toFixed(6),
          longitude: lng.toFixed(6),
          address: result.display_name || "",
          city: result.address?.city || result.address?.town || result.address?.village || "",
          state: result.address?.state || "",
          country: result.address?.country || "",
        };
        onPositionChange(lat, lng, locationData);
      } catch {
        onPositionChange(lat, lng, {
          latitude: lat.toFixed(6),
          longitude: lng.toFixed(6),
          address: "",
          city: "",
          state: "",
          country: "",
        });
      }
    },
  });

  return null;
}

function DraggableMarker({
  position,
  onPositionChange,
}: {
  position: [number, number];
  onPositionChange: (lat: number, lng: number, location: LocationData) => void;
}) {
  const markerRef = useRef<L.Marker>(null);

  const eventHandlers = {
    async dragend() {
      const marker = markerRef.current;
      if (marker) {
        const { lat, lng } = marker.getLatLng();
        try {
          const result = await reverseGeocode(lat, lng);
          const locationData: LocationData = {
            latitude: lat.toFixed(6),
            longitude: lng.toFixed(6),
            address: result.display_name || "",
            city: result.address?.city || result.address?.town || result.address?.village || "",
            state: result.address?.state || "",
            country: result.address?.country || "",
          };
          onPositionChange(lat, lng, locationData);
        } catch {
          onPositionChange(lat, lng, {
            latitude: lat.toFixed(6),
            longitude: lng.toFixed(6),
            address: "",
            city: "",
            state: "",
            country: "",
          });
        }
      }
    },
  };

  return (
    <Marker
      position={position}
      icon={icon}
      draggable={true}
      ref={markerRef}
      eventHandlers={eventHandlers}
    />
  );
}

export default function LeafletMap({ position, onPositionChange }: LeafletMapProps) {
  const defaultCenter: [number, number] = [17.385, 78.4867]; // Hyderabad
  const [mapReady, setMapReady] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Prevent double initialization in React Strict Mode
    // Clean up any existing Leaflet map instance on the container
    if (mapContainerRef.current) {
      const container = mapContainerRef.current;
      // @ts-ignore - Leaflet attaches _leaflet_id to initialized containers
      if (container._leaflet_id) {
        // @ts-ignore
        delete container._leaflet_id;
      }
    }
    setMapReady(true);

    return () => {
      setMapReady(false);
    };
  }, []);

  if (!mapReady) {
    return <div ref={mapContainerRef} className="h-full w-full bg-gray-100" />;
  }

  return (
    <div ref={mapContainerRef} className="h-full w-full">
      <MapContainer
        center={position || defaultCenter}
        zoom={position ? 15 : 5}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater position={position} />
        <MapClickHandler onPositionChange={onPositionChange} />
        {position && (
          <DraggableMarker position={position} onPositionChange={onPositionChange} />
        )}
      </MapContainer>
    </div>
  );
}
