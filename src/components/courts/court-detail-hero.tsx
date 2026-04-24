import Link from "next/link";
import type { Court } from "@/types";

interface CourtDetailHeroProps {
  court: Court;
}

export function CourtDetailHero({ court }: CourtDetailHeroProps) {
  return (
    <div className="relative h-[397px] overflow-hidden">
      {/* Background */}
      {court.image_url ? (
        <img
          src={court.image_url}
          alt={court.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full signature-gradient" />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 pt-14">
        <Link
          href="/courts"
          className="w-10 h-10 rounded-full glass flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-on-surface">
            arrow_back
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 rounded-full glass flex items-center justify-center">
            <span className="material-symbols-outlined text-on-surface">
              share
            </span>
          </button>
          <button className="w-10 h-10 rounded-full glass flex items-center justify-center">
            <span className="material-symbols-outlined text-error">
              favorite
            </span>
          </button>
        </div>
      </div>

      {/* Content overlay */}
      <div className="absolute bottom-8 left-5 right-5">
        {court.status === "open" && (
          <span className="inline-block bg-tertiary-container text-on-tertiary-container px-3 py-1 rounded-full font-headline text-xs font-bold uppercase tracking-wider mb-3">
            Verified Venue
          </span>
        )}
        <h1 className="font-headline text-4xl font-extrabold text-on-surface tracking-tight leading-tight">
          {court.name}
        </h1>
        <div className="flex items-center gap-1 mt-2 text-on-surface-variant">
          <span className="material-symbols-outlined text-sm text-primary">
            location_on
          </span>
          <span className="font-body text-sm">{court.address}</span>
        </div>
      </div>
    </div>
  );
}
