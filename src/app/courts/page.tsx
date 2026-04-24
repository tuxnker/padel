"use client";

import dynamic from "next/dynamic";
import { useState, useMemo, useEffect } from "react";
import { CourtCard } from "@/components/courts/court-card";
import { CourtFilters } from "@/components/courts/court-filters";
import { CourtSearch } from "@/components/courts/court-search";
import type { Court } from "@/types";
import { createClient } from "@/lib/supabase/client";
import seedCourts from "@/data/courts-seed.json";

const CourtMap = dynamic(
  () =>
    import("@/components/courts/court-map").then((mod) => mod.CourtMap),
  { ssr: false, loading: () => <div className="h-full w-full bg-surface-container-low animate-pulse" /> }
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

export default function CourtsPage() {
  const [allCourts, setAllCourts] = useState<Court[]>(fallbackCourts);
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

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

    if (activeFilter !== "all") {
      if (activeFilter === "indoor") {
        courts = courts.filter((c) => c.court_type === "indoor");
      } else if (activeFilter === "outdoor") {
        courts = courts.filter((c) => c.court_type === "outdoor");
      } else if (activeFilter === "under40") {
        courts = courts.filter(
          (c) =>
            !c.membership_required &&
            c.price_offpeak_eur !== null &&
            c.price_offpeak_eur < 40
        );
      } else if (activeFilter === "membership") {
        courts = courts.filter((c) => c.membership_required);
      }
    }

    return courts;
  }, [allCourts, searchQuery, activeFilter]);

  return (
    <div className="relative h-[calc(100vh-6rem)] -mt-16 pt-16">
      {/* Search + Filters overlay */}
      <div className="absolute top-20 left-0 right-0 z-10 space-y-2">
        <CourtSearch value={searchQuery} onChange={setSearchQuery} />
        <CourtFilters
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />
      </div>

      {/* Map */}
      <div className="h-full w-full">
        <CourtMap
          courts={filteredCourts}
          selectedCourtId={selectedCourt?.id ?? null}
          onSelectCourt={setSelectedCourt}
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
