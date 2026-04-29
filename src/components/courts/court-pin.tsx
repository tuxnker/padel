"use client";

import { Marker, Tooltip } from "react-leaflet";
import L from "leaflet";
import type { Court } from "@/types";

interface CourtPinProps {
  court: Court;
  isSelected: boolean;
  onClick: () => void;
}

function createPinIcon(isSelected: boolean) {
  const size = isSelected ? 48 : 40;
  const bg = isSelected ? "#C6FF00" : "#00E6B2";
  const border = isSelected ? "#0B1220" : "#FFFFFF";
  const iconColor = "#0B1220";

  return L.divIcon({
    className: "custom-pin",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: ${bg};
        border: 3px solid ${border};
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 12px 28px rgba(0, 0, 0, 0.35);
        transition: all 0.2s ease;
        cursor: pointer;
      ">
        <span class="material-symbols-outlined" style="
          font-size: ${isSelected ? 24 : 20}px;
          color: ${iconColor};
          font-variation-settings: 'FILL' 1;
        ">sports_tennis</span>
      </div>
    `,
  });
}

export function CourtPin({ court, isSelected, onClick }: CourtPinProps) {
  return (
    <Marker
      position={[court.latitude, court.longitude]}
      icon={createPinIcon(isSelected)}
      eventHandlers={{ click: onClick }}
      title={court.name}
      alt={court.name}
      keyboard={true}
    >
      {!isSelected && (
        <Tooltip
          direction="bottom"
          offset={[0, 20]}
          className="court-tooltip"
          permanent={false}
        >
          <span className="font-headline text-sm font-bold">{court.name}</span>
        </Tooltip>
      )}
    </Marker>
  );
}
