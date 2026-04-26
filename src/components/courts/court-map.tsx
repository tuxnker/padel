"use client";

import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { CourtPin } from "./court-pin";
import type { Court } from "@/types";
import type { LatLng } from "@/lib/geo";
import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

export const PADEL_TILE_URL =
  "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png";
export const PADEL_TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

interface CourtMapProps {
  courts: Court[];
  selectedCourtId: string | null;
  onSelectCourt: (court: Court) => void;
  userLocation?: LatLng | null;
  nearbyRadiusKm?: number | null;
  nearbyActive?: boolean;
}

function FitBounds({
  courts,
  userLocation,
  nearbyActive,
}: {
  courts: Court[];
  userLocation?: LatLng | null;
  nearbyActive?: boolean;
}) {
  const map = useMap();
  const hasFittedRef = useRef(false);
  const prevNearbyRef = useRef(nearbyActive ?? false);

  useEffect(() => {
    const justTurnedOnNearby = !prevNearbyRef.current && nearbyActive === true;
    prevNearbyRef.current = nearbyActive ?? false;

    if (hasFittedRef.current && !justTurnedOnNearby) {
      return;
    }

    const points: Array<[number, number]> = courts.map(
      (c) => [c.latitude, c.longitude] as [number, number],
    );
    if (userLocation) {
      points.push([userLocation.lat, userLocation.lng]);
    }
    if (points.length === 0) return;

    if (points.length === 1) {
      map.setView(points[0], 13);
    } else {
      map.fitBounds(points, { padding: [50, 50], maxZoom: 13 });
    }
    hasFittedRef.current = true;
  }, [courts, userLocation, nearbyActive, map]);

  return null;
}

function UserLocationOverlay({
  location,
  radiusKm,
}: {
  location: LatLng | null | undefined;
  radiusKm: number | null | undefined;
}) {
  const map = useMap();

  useEffect(() => {
    if (!location) return;
    const dot = L.circle([location.lat, location.lng], {
      radius: 120,
      color: "#0b6f57",
      fillColor: "#0b6f57",
      fillOpacity: 0.85,
      weight: 2,
      interactive: false,
    }).addTo(map);

    let radius: L.Circle | null = null;
    if (radiusKm && radiusKm > 0) {
      radius = L.circle([location.lat, location.lng], {
        radius: radiusKm * 1000,
        color: "#0b6f57",
        fillColor: "#0b6f57",
        fillOpacity: 0.06,
        weight: 1,
        dashArray: "4 4",
        interactive: false,
      }).addTo(map);
    }

    return () => {
      dot.remove();
      radius?.remove();
    };
  }, [map, location, radiusKm]);

  return null;
}

export function CourtMap({
  courts,
  selectedCourtId,
  onSelectCourt,
  userLocation,
  nearbyRadiusKm,
  nearbyActive,
}: CourtMapProps) {
  return (
    <MapContainer
      center={[53.3498, -6.2603]}
      zoom={12}
      className="h-full w-full z-0"
      zoomControl={false}
    >
      <TileLayer url={PADEL_TILE_URL} attribution={PADEL_TILE_ATTRIBUTION} />
      <FitBounds
        courts={courts}
        userLocation={userLocation}
        nearbyActive={nearbyActive}
      />
      <UserLocationOverlay
        location={userLocation}
        radiusKm={nearbyRadiusKm}
      />
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
