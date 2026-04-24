"use client";

import { MapContainer, TileLayer, useMap } from "react-leaflet";
import { CourtPin } from "./court-pin";
import type { Court } from "@/types";
import { useEffect } from "react";
import "leaflet/dist/leaflet.css";

interface CourtMapProps {
  courts: Court[];
  selectedCourtId: string | null;
  onSelectCourt: (court: Court) => void;
}

function FitBounds({ courts }: { courts: Court[] }) {
  const map = useMap();

  useEffect(() => {
    if (courts.length === 0) return;
    const bounds = courts.map(
      (c) => [c.latitude, c.longitude] as [number, number]
    );
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
  }, [courts, map]);

  return null;
}

export function CourtMap({
  courts,
  selectedCourtId,
  onSelectCourt,
}: CourtMapProps) {
  return (
    <MapContainer
      center={[53.3498, -6.2603]}
      zoom={12}
      className="h-full w-full z-0"
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <FitBounds courts={courts} />
      {courts.map((court) => (
        <CourtPin
          key={court.id}
          court={court}
          isSelected={court.id === selectedCourtId}
          onClick={() => onSelectCourt(court)}
        />
      ))}
    </MapContainer>
  );
}
