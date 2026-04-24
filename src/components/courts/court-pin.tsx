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
  const bg = isSelected ? "#ffd709" : "#006941";
  const border = isSelected ? "#6c5a00" : "#ffffff";
  const iconColor = isSelected ? "#5b4b00" : "#caffdc";

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
        box-shadow: 0 8px 24px rgba(40, 49, 44, 0.15);
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
