"use client";

import Link from "next/link";
import type { Court } from "@/types";
import { formatPrice, formatBookingMethod } from "@/lib/utils";

interface CourtCardProps {
  court: Court;
  onClose: () => void;
}

export function CourtCard({ court, onClose }: CourtCardProps) {
  const priceLabel = court.membership_required
    ? "Membership required"
    : `${formatPrice(court.price_offpeak_eur)}/hr`;

  return (
    <div className="absolute bottom-4 left-4 right-4 z-20 animate-slide-up">
      <div className="bg-surface-container-lowest rounded-3xl editorial-shadow overflow-hidden">
        {/* Court image or gradient fallback */}
        <div className="relative h-48 overflow-hidden">
          {court.image_url ? (
            <img
              src={court.image_url}
              alt={court.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full signature-gradient flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary text-6xl opacity-30">
                sports_tennis
              </span>
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-container-lowest/80 backdrop-blur-sm flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-on-surface text-sm">
              close
            </span>
          </button>
        </div>

        {/* Court info */}
        <div className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-headline text-2xl font-extrabold text-on-surface tracking-tight">
                {court.name}
              </h3>
              <div className="flex items-center gap-1 mt-1 text-on-surface-variant">
                <span className="material-symbols-outlined text-sm">star</span>
                <span className="font-headline text-sm font-semibold">4.9</span>
                <span className="text-sm">(124 reviews)</span>
              </div>
            </div>
            <button className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center">
              <span className="material-symbols-outlined text-outline">
                favorite
              </span>
            </button>
          </div>

          <div className="flex items-center gap-6 mt-4 text-on-surface-variant">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">
                grid_view
              </span>
              <span className="font-body text-sm">
                {court.court_count} {court.court_type} courts
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">
                {court.membership_required ? "id_card" : "payments"}
              </span>
              <span className="font-headline text-sm font-semibold">
                {priceLabel}
              </span>
            </div>
          </div>

          <Link
            href={`/courts/${court.slug}`}
            className="mt-4 w-full h-12 rounded-2xl signature-gradient text-on-primary font-headline font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            {court.booking_url
              ? `Book on ${formatBookingMethod(court.booking_method)}`
              : "View Details"}
            <span className="material-symbols-outlined text-lg">
              arrow_forward
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
