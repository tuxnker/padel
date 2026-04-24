import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Court } from "@/types";
import { CourtDetailHero } from "@/components/courts/court-detail-hero";
import { CourtAmenities } from "@/components/courts/court-amenities";
import { CourtInfoCards } from "@/components/courts/court-info-cards";
import { CourtBookingCta } from "@/components/courts/court-booking-cta";
import { NearbyCourts } from "@/components/courts/nearby-courts";
import Link from "next/link";
import seedCourts from "@/data/courts-seed.json";
import { fetchPostsForCourt } from "@/lib/posts";
import { PostCard } from "@/components/posts/post-card";

type SeedCourt = Omit<Court, "id" | "email"> & {
  id?: string;
  email?: string | null;
};

const fallbackCourts: Court[] = (seedCourts as SeedCourt[]).map((court) => ({
  ...court,
  id: court.id ?? court.slug,
  email: court.email ?? null,
}));

function getFallbackCourt(slug: string) {
  return fallbackCourts.find((court) => court.slug === slug) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: court } = await supabase.from("courts").select("*").eq("slug", slug).single();
  const resolvedCourt = (court as Court | null) ?? getFallbackCourt(slug);
  
  if (!resolvedCourt) return { title: "Court Not Found" };

  return {
    title: `${resolvedCourt.name} - Padel Courts`,
    description: `${resolvedCourt.name} in ${resolvedCourt.address}. ${resolvedCourt.court_count} ${resolvedCourt.court_type} courts${resolvedCourt.membership_required ? " with member access required" : ""}.`,
    openGraph: {
      title: resolvedCourt.name,
      description: `${resolvedCourt.court_count} padel courts in ${resolvedCourt.address}`,
    },
  };
}

export default async function CourtDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: court } = await supabase
    .from("courts")
    .select("*")
    .eq("slug", slug)
    .single();
  const resolvedCourt = (court as Court | null) ?? getFallbackCourt(slug);

  if (!resolvedCourt) notFound();

  // Simple nearby courts approximation using a basic limit
  // (In a real app, we'd use PostGIS distance queries)
  const { data: nearby } = await supabase
    .from("courts")
    .select("*")
    .neq("slug", slug)
    .limit(5);
  const nearbyCourts =
    nearby && nearby.length > 0
      ? (nearby as Court[])
      : fallbackCourts.filter((court) => court.slug !== slug).slice(0, 5);

  const courtPosts = resolvedCourt.id
    ? await fetchPostsForCourt(supabase, resolvedCourt.id)
    : [];

  return (
    <div className="-mt-16">
      <CourtDetailHero court={resolvedCourt} />

      <div className="px-5 pb-32 space-y-8">
        {/* Amenities */}
        {resolvedCourt.amenities && resolvedCourt.amenities.length > 0 && (
          <CourtAmenities amenities={resolvedCourt.amenities} />
        )}

        {/* Info Cards */}
        <CourtInfoCards court={resolvedCourt} />

        {/* Looking for Games */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-headline text-xl font-extrabold text-on-surface">
                Looking for Games
              </h2>
              <p className="text-sm text-on-surface-variant mt-0.5">
                Join local players at this venue
              </p>
            </div>
            <Link
              href="/play"
              className="font-headline text-sm font-bold text-secondary"
            >
              View All
            </Link>
          </div>

          {courtPosts.length > 0 ? (
            <div className="space-y-4">
              {courtPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="bg-surface-container-lowest rounded-2xl p-5 text-center">
              <span className="material-symbols-outlined text-outline-variant text-4xl mb-2">
                group
              </span>
              <p className="text-sm text-on-surface-variant">
                No active games at this venue yet.
              </p>
              <Link
                href={`/play?create=true&court=${resolvedCourt.slug}`}
                className="mt-3 inline-flex items-center gap-1 font-headline text-sm font-bold text-primary"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                Create a Game
              </Link>
            </div>
          )}
        </section>

        {/* Booking CTA */}
        <CourtBookingCta court={resolvedCourt} />

        {/* Venue Features */}
        {resolvedCourt.amenities && resolvedCourt.amenities.length > 0 && (
          <section>
            <h2 className="font-headline text-xl font-extrabold text-on-surface mb-4">
              Venue Features
            </h2>
            <div className="space-y-3">
              {resolvedCourt.amenities.map((amenity: string) => (
                <div key={amenity} className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-xl">
                    check_circle
                  </span>
                  <span className="font-body text-sm text-on-surface capitalize">
                    {amenity === "pro_shop"
                      ? "Pro Shop"
                      : amenity === "floodlights"
                      ? "Professional Floodlighting"
                      : amenity === "rental"
                      ? "Equipment Rental Available"
                      : amenity === "coaching"
                      ? "Coaching & Training Programs"
                      : amenity.charAt(0).toUpperCase() + amenity.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Nearby Courts */}
        <NearbyCourts courts={nearbyCourts} />
      </div>
    </div>
  );
}
