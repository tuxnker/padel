const SPECIAL_CASES: Record<string, string> = {
  pro_shop: "Pro Shop",
  floodlights: "Professional Floodlighting",
  rental: "Equipment Rental Available",
  coaching: "Coaching & Training Programs",
  wifi: "Wi-Fi",
  ice_bath: "Ice Bath",
};

export function humaniseAmenity(value: string): string {
  if (SPECIAL_CASES[value]) return SPECIAL_CASES[value];
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
