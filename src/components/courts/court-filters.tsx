"use client";

import { cn } from "@/lib/utils";
import type { UserLocationStatus } from "@/hooks/use-user-location";
import { NEARBY_RADIUS_KM } from "@/lib/geo";

const filters = [
  { label: `Near me (${NEARBY_RADIUS_KM}km)`, value: "nearby" },
  { label: "Indoor", value: "indoor" },
  { label: "Outdoor", value: "outdoor" },
  { label: "Under €40", value: "under40" },
  { label: "Members", value: "membership" },
] as const;

const COURT_FILTER_GROUPS: Record<string, string> = {
  indoor: "type",
  outdoor: "type",
  under40: "price",
  membership: "membership",
  nearby: "location",
};

interface CourtFiltersProps {
  activeFilters: Set<string>;
  onChange: (next: Set<string>) => void;
  locationStatus?: UserLocationStatus;
  onRequestLocation?: () => void;
}

export function CourtFilters({
  activeFilters,
  onChange,
  locationStatus,
  onRequestLocation,
}: CourtFiltersProps) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar px-5 py-2">
      {filters.map((filter) => {
        const isNearby = filter.value === "nearby";
        const isLoading = isNearby && locationStatus === "loading";
        const isDenied = isNearby && locationStatus === "denied";
        const isUnavailable = isNearby && locationStatus === "unavailable";
        const isActive = activeFilters.has(filter.value);

        const handleClick = () => {
          const next = new Set(activeFilters);
          if (next.has(filter.value)) {
            next.delete(filter.value);
          } else {
            const group = COURT_FILTER_GROUPS[filter.value];
            if (group) {
              for (const value of [...next]) {
                if (COURT_FILTER_GROUPS[value] === group) next.delete(value);
              }
            }
            if (
              isNearby &&
              onRequestLocation &&
              locationStatus !== "granted"
            ) {
              onRequestLocation();
            }
            next.add(filter.value);
          }
          onChange(next);
        };

        return (
          <button
            key={filter.value}
            type="button"
            onClick={handleClick}
            aria-pressed={isActive}
            disabled={isUnavailable}
            className={cn(
              "px-5 py-2.5 rounded-full border font-headline text-sm font-bold whitespace-nowrap transition-all active:scale-95 inline-flex items-center gap-1.5 backdrop-blur",
              isActive
                ? "border-primary bg-primary text-on-primary"
                : "border-outline-variant bg-surface-container/95 text-on-surface hover:border-primary hover:text-primary",
              isUnavailable && "opacity-50",
            )}
            title={
              isDenied
                ? "Location permission denied — enable it in your browser to use this filter"
                : isUnavailable
                  ? "Geolocation isn't available on this device"
                  : undefined
            }
          >
            {isNearby && (
              <span
                className={cn(
                  "material-symbols-outlined text-base",
                  isLoading && "animate-spin",
                )}
              >
                {isLoading ? "progress_activity" : "near_me"}
              </span>
            )}
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
