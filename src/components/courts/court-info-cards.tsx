import type { Court } from "@/types";
import { formatPrice } from "@/lib/utils";

interface CourtInfoCardsProps {
  court: Court;
}

export function CourtInfoCards({ court }: CourtInfoCardsProps) {
  return (
    <div className="space-y-4">
      {/* Opening Hours */}
      {court.hours && (
        <div className="bg-surface-container-low rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary">
              schedule
            </span>
            <h3 className="font-headline text-lg font-bold text-on-surface">
              Opening Hours
            </h3>
          </div>
          <div className="space-y-2">
            {Object.entries(court.hours).map(([day, hours]) => (
              <div
                key={day}
                className="flex items-center justify-between font-body text-sm"
              >
                <span className="text-on-surface-variant">{day}</span>
                <span className="text-on-surface font-medium">{hours}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Access and Price Info */}
      <div className="bg-surface-container-low rounded-2xl p-5 border-l-4 border-tertiary">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-tertiary">
            {court.membership_required ? "id_card" : "payments"}
          </span>
          <h3 className="font-headline text-lg font-bold text-on-surface">
            {court.membership_required ? "Access" : "Price Info"}
          </h3>
        </div>
        {court.membership_required ? (
          <>
            <p className="font-headline text-3xl font-extrabold text-on-surface">
              Membership required
            </p>
            <p className="text-sm text-on-surface-variant mt-2">
              This venue is private or member-only, so hourly court rental prices are not listed.
            </p>
          </>
        ) : (
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
            {court.price_peak_eur && (
              <p className="text-xs text-on-surface-variant mt-1 font-headline uppercase tracking-wider">
                Peak times: {formatPrice(court.price_peak_eur)}/hr
              </p>
            )}
          </>
        )}
      </div>

      {/* Map snippet */}
      <div className="bg-surface-container-low rounded-2xl overflow-hidden">
        <div className="h-40 bg-surface-container relative flex items-center justify-center">
          <div className="text-center">
            <span className="material-symbols-outlined text-primary text-3xl">
              location_on
            </span>
            <p className="font-headline text-sm font-bold text-on-surface mt-1">
              {court.name}
            </p>
          </div>
        </div>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${court.latitude},${court.longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-3 font-headline text-sm font-bold text-secondary"
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
