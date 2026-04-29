"use client";

import dynamic from "next/dynamic";

const CourtMiniMap = dynamic(
  () => import("./court-mini-map").then((m) => m.CourtMiniMap),
  { ssr: false, loading: () => <div className="h-40 bg-[#0B1220]" /> },
);

interface CourtMiniMapClientProps {
  lat: number;
  lng: number;
  name: string;
}

export function CourtMiniMapClient(props: CourtMiniMapClientProps) {
  return <CourtMiniMap {...props} />;
}
