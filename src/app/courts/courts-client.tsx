"use client";

import dynamic from "next/dynamic";
import { useState, useMemo, useEffect } from "react";
import { CourtCard } from "@/components/courts/court-card";
import { CourtFilters } from "@/components/courts/court-filters";
import { CourtSearch } from "@/components/courts/court-search";
import type { Court } from "@/types";
import { createClient } from "@/lib/supabase/client";
import seedCourts from "@/data/courts-seed.json";
import { useUserLocation } from "@/hooks/use-user-location";
import { NEARBY_RADIUS_KM, haversineKm } from "@/lib/geo";

const CourtMap = dynamic(
  () =>
    import("@/components/courts/court-map").then((mod) => mod.CourtMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full bg-[#0B1220] animate-pulse" />
    ),
  }
);

type SeedCourt = Omit<Court, "id" | "email"> & {
  id?: string;
  email?: string | null;
};

const fallbackCourts: Court[] = (seedCourts as SeedCourt[]).map((court) => ({
  ...court,
  id: court.id ?? court.slug,
  email: court.email ?? null,
}));

function hasUsableCoordinates(court: Court) {
  return (
    Number.isFinite(court.latitude) &&
    Number.isFinite(court.longitude) &&
    Math.abs(court.latitude) > 0 &&
    Math.abs(court.longitude) > 0
  );
}

function mergeCourts(seedCourts: Court[], databaseCourts: Court[]) {
  const courtsBySlug = new Map(seedCourts.map((court) => [court.slug, court]));

  for (const court of databaseCourts) {
    courtsBySlug.set(court.slug, court);
  }

  return [...courtsBySlug.values()];
}

export function CourtsClient() {
  const [allCourts, setAllCourts] = useState<Court[]>(fallbackCourts);
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [activeFilters, setActiveFilters] = useState<Set<string>>(
    () => new Set(),
  );
  const [searchQuery, setSearchQuery] = useState("");
  const { location, status, requestLocation } = useUserLocation();

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    if (!supabase) return;

    let isMounted = true;

    async function loadCourts() {
      const { data, error } = await supabase
        .from("courts")
        .select("*")
        .order("featured", { ascending: false })
        .order("name");

      if (!isMounted) return;

      if (error) {
        console.error("Failed to load courts from Supabase", error);
        return;
      }

      const courts = ((data ?? []) as Court[]).filter(hasUsableCoordinates);
      if (courts.length > 0) {
        setAllCourts(mergeCourts(fallbackCourts, courts));
      }
    }

    loadCourts();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  const nearbyActive = activeFilters.has("nearby");

  const filteredCourts = useMemo(() => {
    let courts = allCourts;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      courts = courts.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.address.toLowerCase().includes(q)
      );
    }

    if (activeFilters.has("indoor")) {
      courts = courts.filter((c) => c.court_type === "indoor");
    }
    if (activeFilters.has("outdoor")) {
      courts = courts.filter((c) => c.court_type === "outdoor");
    }
    if (activeFilters.has("under40")) {
      courts = courts.filter(
        (c) =>
          !c.membership_required &&
          c.price_offpeak_eur !== null &&
          c.price_offpeak_eur < 40,
      );
    }
    if (activeFilters.has("membership")) {
      courts = courts.filter((c) => c.membership_required);
    }
    if (activeFilters.has("nearby") && location) {
      courts = courts.filter(
        (c) =>
          haversineKm(location, { lat: c.latitude, lng: c.longitude }) <=
          NEARBY_RADIUS_KM,
      );
    }

    return courts;
  }, [allCourts, searchQuery, activeFilters, location]);

  const showNearbyEmptyState =
    nearbyActive &&
    status === "granted" &&
    location !== null &&
    filteredCourts.length === 0;
  const showNearbyDeniedState =
    nearbyActive && (status === "denied" || status === "unavailable");

  return (
    <div className="relative h-[calc(100vh-6rem)] -mt-16 pt-16">
      {/* Search + Filters overlay */}
      <div className="absolute top-20 left-0 right-0 z-10 space-y-2 pointer-events-none [&>*]:pointer-events-auto">
        <CourtSearch value={searchQuery} onChange={setSearchQuery} />
        <CourtFilters
          activeFilters={activeFilters}
          onChange={setActiveFilters}
          locationStatus={status}
          onRequestLocation={() => {
            void requestLocation();
          }}
        />
        {showNearbyEmptyState && (
          <div className="mx-5 rounded-2xl bg-surface-container-lowest/95 px-4 py-2.5 text-xs text-on-surface-variant shadow-sm">
            No courts within {NEARBY_RADIUS_KM} km. Try a different filter.
          </div>
        )}
        {showNearbyDeniedState && (
          <div className="mx-5 rounded-2xl bg-error-container/90 px-4 py-2.5 text-xs text-on-error-container shadow-sm">
            Location is off. Enable it in your browser to find courts near you.
          </div>
        )}
      </div>

      {/* Map */}
      <div className="h-full w-full">
        <CourtMap
          courts={filteredCourts}
          selectedCourtId={selectedCourt?.id ?? null}
          onSelectCourt={setSelectedCourt}
          userLocation={location}
          nearbyRadiusKm={nearbyActive ? NEARBY_RADIUS_KM : null}
          nearbyActive={nearbyActive}
        />
      </div>

      {/* Selected court card */}
      {selectedCourt && (
        <CourtCard
          court={selectedCourt}
          onClose={() => setSelectedCourt(null)}
        />
      )}
    </div>
  );
}
