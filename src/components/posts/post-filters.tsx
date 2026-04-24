"use client";

import { cn } from "@/lib/utils";

const filters = [
  { label: "Today", value: "today" },
  { label: "Tomorrow", value: "tomorrow" },
  { label: "This Week", value: "week" },
  { label: "Beginner", value: "beginner" },
  { label: "Intermediate", value: "intermediate" },
  { label: "Advanced", value: "advanced" },
] as const;

interface PostFiltersProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export function PostFilters({ activeFilter, onFilterChange }: PostFiltersProps) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar px-5 py-2">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() =>
            onFilterChange(
              activeFilter === filter.value ? "" : filter.value
            )
          }
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
