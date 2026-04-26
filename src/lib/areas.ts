export type Area = {
  slug: string;
  name: string;
  region: "Republic of Ireland" | "Northern Ireland";
  matchTerms: string[];
  blurb: string;
};

export const AREAS: Area[] = [
  {
    slug: "dublin",
    name: "Dublin",
    region: "Republic of Ireland",
    matchTerms: ["dublin"],
    blurb:
      "Padel in Dublin is the most active scene in Ireland, with indoor and outdoor courts spread across the city centre and suburbs.",
  },
  {
    slug: "cork",
    name: "Cork",
    region: "Republic of Ireland",
    matchTerms: ["cork"],
    blurb:
      "Cork has a fast-growing padel community with a mix of dedicated padel venues and tennis clubs that have added courts.",
  },
  {
    slug: "galway",
    name: "Galway",
    region: "Republic of Ireland",
    matchTerms: ["galway"],
    blurb:
      "Galway's padel courts cater to players on the west coast, with both club-based and pay-and-play venues.",
  },
  {
    slug: "limerick",
    name: "Limerick",
    region: "Republic of Ireland",
    matchTerms: ["limerick"],
    blurb:
      "Limerick's padel courts serve the mid-west, with multiple indoor venues for year-round play.",
  },
  {
    slug: "waterford",
    name: "Waterford",
    region: "Republic of Ireland",
    matchTerms: ["waterford"],
    blurb:
      "Waterford's padel scene is small but growing, anchored by venues in and around the city.",
  },
  {
    slug: "wexford",
    name: "Wexford",
    region: "Republic of Ireland",
    matchTerms: ["wexford"],
    blurb:
      "Wexford has a steady selection of padel courts in the south-east, popular with weekenders from Dublin.",
  },
  {
    slug: "wicklow",
    name: "Wicklow",
    region: "Republic of Ireland",
    matchTerms: ["wicklow"],
    blurb:
      "Wicklow's padel courts offer a scenic alternative just south of Dublin.",
  },
  {
    slug: "kildare",
    name: "Kildare",
    region: "Republic of Ireland",
    matchTerms: ["kildare"],
    blurb:
      "Kildare's padel venues are conveniently placed for commuters from Dublin and the surrounding counties.",
  },
  {
    slug: "louth",
    name: "Louth",
    region: "Republic of Ireland",
    matchTerms: ["louth", "drogheda", "dundalk"],
    blurb:
      "Louth's padel courts serve the north-east corridor between Dublin and Belfast.",
  },
  {
    slug: "laois",
    name: "Laois",
    region: "Republic of Ireland",
    matchTerms: ["laois", "portlaoise"],
    blurb:
      "Laois has emerging padel facilities in the midlands, easily reachable from Dublin and Limerick.",
  },
  {
    slug: "belfast",
    name: "Belfast",
    region: "Northern Ireland",
    matchTerms: ["belfast"],
    blurb:
      "Belfast's padel scene is the most developed in Northern Ireland, with multiple indoor venues across the city.",
  },
  {
    slug: "derry",
    name: "Derry",
    region: "Northern Ireland",
    matchTerms: ["derry", "londonderry"],
    blurb:
      "Derry has a small but committed padel scene in the north-west.",
  },
];

export const AREAS_BY_SLUG: Record<string, Area> = Object.fromEntries(
  AREAS.map((area) => [area.slug, area]),
);

export function getArea(slug: string): Area | null {
  return AREAS_BY_SLUG[slug] ?? null;
}

export function courtMatchesArea(
  court: { address: string },
  area: Area,
): boolean {
  const haystack = court.address.toLowerCase();
  return area.matchTerms.some((term) => haystack.includes(term.toLowerCase()));
}
