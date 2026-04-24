"use client";

interface CourtSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function CourtSearch({ value, onChange }: CourtSearchProps) {
  return (
    <div className="px-5">
      <div className="relative">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-xl">
          search
        </span>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search courts in Dublin..."
          className="w-full h-12 pl-12 pr-4 rounded-xl bg-surface-container-lowest text-on-surface font-body text-sm placeholder:text-outline-variant ambient-shadow focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
        />
      </div>
    </div>
  );
}
