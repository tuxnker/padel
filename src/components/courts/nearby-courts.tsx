import Link from "next/link";
import Image from "next/image";
import type { Court } from "@/types";
import { formatPrice } from "@/lib/utils";

interface NearbyCourtsProps {
  courts: Court[];
}

export function NearbyCourts({ courts }: NearbyCourtsProps) {
  if (courts.length === 0) return null;

  return (
    <section>
      <h2 className="font-headline text-xl font-extrabold text-on-surface mb-4">
        Nearby Courts
      </h2>
      <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-5 px-5 pb-2">
        {courts.map((court) => (
          <Link
            key={court.slug}
            href={`/courts/${court.slug}`}
            className="flex-shrink-0 w-56 bg-surface-container-lowest rounded-2xl overflow-hidden ambient-shadow group"
          >
            <div className="h-32 overflow-hidden relative">
              {court.image_url ? (
                <Image
                  src={court.image_url}
                  alt={court.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full signature-gradient flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-primary text-3xl opacity-30">
                    sports_tennis
                  </span>
                </div>
              )}
            </div>
            <div className="p-3">
              <h3 className="font-headline text-sm font-bold text-on-surface truncate">
                {court.name}
              </h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                {court.court_type.charAt(0).toUpperCase() +
                  court.court_type.slice(1)}{" "}
                •{" "}
                {court.membership_required
                  ? "Membership required"
                  : `${formatPrice(court.price_offpeak_eur)}/hr`}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
