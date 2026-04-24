"use client";

import type { SkillLevel } from "@/types";

const levels = [
  {
    value: "beginner" as SkillLevel,
    icon: "sentiment_satisfied",
    label: "Beginner",
    description: "Getting used to the glass.",
  },
  {
    value: "intermediate" as SkillLevel,
    icon: "bolt",
    label: "Intermediate",
    description: "Solid rallies & positioning.",
  },
  {
    value: "advanced" as SkillLevel,
    icon: "military_tech",
    label: "Advanced",
    description: "Tournament ready play.",
  },
];

interface SkillSelectorProps {
  selected: SkillLevel;
  onChange: (level: SkillLevel) => void;
}

export function SkillSelector({ selected, onChange }: SkillSelectorProps) {
  return (
    <div className="px-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-headline text-xs font-bold uppercase tracking-wider text-on-surface-variant">
          Skill Level
        </h2>
        <span className="px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container font-headline text-xs font-bold uppercase">
          {selected}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {levels.map((level) => (
          <button
            key={level.value}
            onClick={() => onChange(level.value)}
            className={`rounded-2xl p-4 flex flex-col items-center text-center gap-2 transition-all ${
              selected === level.value
                ? "bg-primary/5 ring-2 ring-primary"
                : "bg-surface-container-lowest"
            }`}
          >
            <span
              className={`material-symbols-outlined text-2xl ${
                selected === level.value ? "text-primary" : "text-outline"
              }`}
              style={
                level.value === "intermediate"
                  ? { fontVariationSettings: "'FILL' 1" }
                  : undefined
              }
            >
              {level.icon}
            </span>
            <span
              className={`font-headline text-sm font-bold ${
                selected === level.value
                  ? "text-primary"
                  : "text-on-surface"
              }`}
            >
              {level.label}
            </span>
            <span className="text-xs text-on-surface-variant leading-tight">
              {level.description}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
