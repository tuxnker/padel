import type { Court } from "@/types";
import { formatBookingMethod } from "@/lib/utils";

interface CourtBookingCtaProps {
  court: Court;
}

export function CourtBookingCta({ court }: CourtBookingCtaProps) {
  const title = court.membership_required ? "Membership required" : "Ready to play?";
  const description = court.membership_required
    ? "Contact the venue for access and member booking details."
    : `Instant booking via ${formatBookingMethod(court.booking_method)}`;

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-6 border-t-4 border-primary">
      <h3 className="font-headline text-xl font-extrabold text-on-surface text-center">
        {title}
      </h3>
      <p className="text-sm text-on-surface-variant text-center mt-1">
        {description}
      </p>
      {court.booking_url ? (
        <a
          href={court.booking_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 w-full h-12 rounded-2xl signature-gradient text-on-primary font-headline font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        >
          {court.membership_required
            ? "View Access Details"
            : `Book on ${formatBookingMethod(court.booking_method)}`}
          <span className="material-symbols-outlined text-lg">
            open_in_new
          </span>
        </a>
      ) : (
        <a
          href={`tel:${court.phone}`}
          className="mt-4 w-full h-12 rounded-2xl signature-gradient text-on-primary font-headline font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        >
          Call to Book
          <span className="material-symbols-outlined text-lg">call</span>
        </a>
      )}
      <p className="text-xs text-on-surface-variant text-center mt-3 flex items-center justify-center gap-1">
        <span className="material-symbols-outlined text-xs text-tertiary">
          bolt
        </span>
        {court.membership_required ? "Member access may apply" : "Real-time availability"}
      </p>
    </div>
  );
}
