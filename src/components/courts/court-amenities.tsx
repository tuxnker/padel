import { humaniseAmenity } from "@/lib/labels";

const amenityIcons: Record<string, string> = {
  cafe: "coffee",
  parking: "local_parking",
  rental: "sports_tennis",
  showers: "shower",
  coaching: "school",
  pro_shop: "storefront",
  floodlights: "lightbulb",
  gym: "fitness_center",
};

interface CourtAmenitiesProps {
  amenities: string[];
}

export function CourtAmenities({ amenities }: CourtAmenitiesProps) {
  const displayAmenities = amenities.slice(0, 4);

  return (
    <div className="grid grid-cols-2 gap-3">
      {displayAmenities.map((amenity) => (
        <div
          key={amenity}
          className="bg-surface-container-lowest rounded-xl p-4 flex flex-col items-center gap-2"
        >
          <span className="material-symbols-outlined text-primary text-2xl">
            {amenityIcons[amenity] || "check_circle"}
          </span>
          <span className="font-headline text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            {humaniseAmenity(amenity)}
          </span>
        </div>
      ))}
    </div>
  );
}
