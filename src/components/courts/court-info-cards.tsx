import type { Court } from "@/types";
import { formatPrice } from "@/lib/utils";
import { CourtMiniMapClient } from "./court-mini-map-client";

interface CourtInfoCardsProps {
  court: Court;
}

const DAY_ORDER: Array<{ key: string; label: string }> = [
  { key: "Monday", label: "Mon" },
  { key: "Tuesday", label: "Tue" },
  { key: "Wednesday", label: "Wed" },
  { key: "Thursday", label: "Thu" },
  { key: "Friday", label: "Fri" },
  { key: "Saturday", label: "Sat" },
  { key: "Sunday", label: "Sun" },
];

export function CourtInfoCards({ court }: CourtInfoCardsProps) {
  const hasPublicPrice =
    !court.membership_required && court.price_offpeak_eur != null;

  return (
    <div className="space-y-4">
      {/* Opening Hours */}
      {court.hours && (
        <div className="rounded-2xl border border-outline-variant bg-surface-container p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary">
              schedule
            </span>
            <h3 className="font-headline text-lg font-bold text-on-surface">
              Opening Hours
            </h3>
          </div>
          <div className="space-y-2">
            {DAY_ORDER.map(({ key, label }) => {
              const hours = court.hours?.[key];
              if (!hours) return null;
              return (
                <div
                  key={key}
                  className="flex items-center justify-between font-body text-sm"
                >
                  <span className="text-on-surface-variant">{label}</span>
                  <span className="text-on-surface font-medium">{hours}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Access and Price Info */}
      <div className="rounded-2xl border border-outline-variant bg-surface-container p-5 border-l-4 border-l-secondary">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-secondary">
            {hasPublicPrice ? "payments" : "id_card"}
          </span>
          <h3 className="font-headline text-lg font-bold text-on-surface">
            {hasPublicPrice ? "Price Info" : "Access"}
          </h3>
        </div>
        {hasPublicPrice ? (
          <>
            <p className="text-sm text-on-surface-variant mb-1">
              Court rental starts from:
            </p>
            <p className="font-headline text-4xl font-extrabold text-on-surface">
              {formatPrice(court.price_offpeak_eur)}
              <span className="text-lg font-normal text-on-surface-variant">
                /hr
              </span>
            </p>
            {court.price_peak_eur != null && (
              <p className="text-xs text-on-surface-variant mt-1 font-headline uppercase tracking-wider">
                Peak times: {formatPrice(court.price_peak_eur)}/hr
              </p>
            )}
          </>
        ) : (
          <>
            <p className="font-headline text-3xl font-extrabold text-on-surface">
              {court.membership_required ? "Membership required" : "Contact venue"}
            </p>
            <p className="text-sm text-on-surface-variant mt-2">
              {court.membership_required
                ? "This venue is private or member-only, so hourly court rental prices are not listed."
                : "This venue hasn't published an hourly rate. Use the booking links to check pricing."}
            </p>
          </>
        )}
      </div>

      {/* Map snippet */}
      <div className="overflow-hidden rounded-2xl border border-outline-variant bg-surface-container">
        <CourtMiniMapClient lat={court.latitude} lng={court.longitude} name={court.name} />
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${court.latitude},${court.longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-3 font-headline text-sm font-bold text-primary hover:text-secondary transition-colors"
        >
          Open in Maps
          <span className="material-symbols-outlined text-sm">
            open_in_new
          </span>
        </a>
      </div>
    </div>
  );
}
