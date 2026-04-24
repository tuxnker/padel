"use client";

import { cn } from "@/lib/utils";

const filters = [
  { label: "All", value: "all" },
  { label: "Indoor", value: "indoor" },
  { label: "Outdoor", value: "outdoor" },
  { label: "Under €40", value: "under40" },
  { label: "Members", value: "membership" },
] as const;

interface CourtFiltersProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export function CourtFilters({
  activeFilter,
  onFilterChange,
}: CourtFiltersProps) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar px-5 py-2">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onFilterChange(filter.value)}
          className={cn(
            "px-5 py-2.5 rounded-full font-headline text-sm font-bold whitespace-nowrap transition-all active:scale-95",
            activeFilter === filter.value
              ? "bg-primary text-on-primary"
              : "bg-surface-container-highest text-on-surface"
          )}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
