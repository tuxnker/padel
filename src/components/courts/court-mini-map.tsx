"use client";

import { MapContainer, Marker, TileLayer } from "react-leaflet";
import L from "leaflet";
import { PADEL_TILE_URL, PADEL_TILE_ATTRIBUTION } from "./court-map";
import "leaflet/dist/leaflet.css";

interface CourtMiniMapProps {
  lat: number;
  lng: number;
  name: string;
}

const miniPinIcon = L.divIcon({
  className: "custom-pin",
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  html: `
    <div style="
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #006941;
      border: 3px solid #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 6px 16px rgba(40, 49, 44, 0.2);
    ">
      <span class="material-symbols-outlined" style="
        font-size: 18px;
        color: #caffdc;
        font-variation-settings: 'FILL' 1;
      ">sports_tennis</span>
    </div>
  `,
});

export function CourtMiniMap({ lat, lng, name }: CourtMiniMapProps) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={15}
      scrollWheelZoom={false}
      dragging={false}
      doubleClickZoom={false}
      zoomControl={false}
      style={{ height: 160, width: "100%" }}
    >
      <TileLayer url={PADEL_TILE_URL} attribution={PADEL_TILE_ATTRIBUTION} />
      <Marker
        position={[lat, lng]}
        icon={miniPinIcon}
        title={name}
        alt={name}
        interactive={false}
      />
    </MapContainer>
  );
}
