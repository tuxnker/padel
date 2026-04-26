"use client";

import { cn } from "@/lib/utils";
import type { UserLocationStatus } from "@/hooks/use-user-location";
import { NEARBY_RADIUS_KM } from "@/lib/geo";

const filters = [
  { label: `Near me (${NEARBY_RADIUS_KM}km)`, value: "nearby" },
  { label: "Today", value: "today" },
  { label: "Tomorrow", value: "tomorrow" },
  { label: "This Week", value: "week" },
  { label: "Beginner", value: "beginner" },
  { label: "Intermediate", value: "intermediate" },
  { label: "Advanced", value: "advanced" },
] as const;

const FILTER_GROUPS: Record<string, string> = {
  today: "date",
  tomorrow: "date",
  week: "date",
  beginner: "skill",
  intermediate: "skill",
  advanced: "skill",
  nearby: "location",
};

interface PostFiltersProps {
  activeFilters: Set<string>;
  onChange: (next: Set<string>) => void;
  locationStatus?: UserLocationStatus;
  onRequestLocation?: () => void;
}

export function PostFilters({
  activeFilters,
  onChange,
  locationStatus,
  onRequestLocation,
}: PostFiltersProps) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar px-5 py-2">
      {filters.map((filter) => {
        const isNearby = filter.value === "nearby";
        const isLoading = isNearby && locationStatus === "loading";
        const isUnavailable = isNearby && locationStatus === "unavailable";
        const isActive = activeFilters.has(filter.value);

        const handleClick = () => {
          const next = new Set(activeFilters);
          if (next.has(filter.value)) {
            next.delete(filter.value);
          } else {
            const group = FILTER_GROUPS[filter.value];
            if (group) {
              for (const value of [...next]) {
                if (FILTER_GROUPS[value] === group) next.delete(value);
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
              "px-5 py-2.5 rounded-full font-headline text-sm font-bold whitespace-nowrap transition-all active:scale-95 inline-flex items-center gap-1.5",
              isActive
                ? "bg-primary text-on-primary"
                : "bg-surface-container-highest text-on-surface",
              isUnavailable && "opacity-50",
            )}
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
