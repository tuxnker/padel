"use client";

import { PostCard } from "./post-card";
import type { Post } from "@/types";
import { useRealtimePosts } from "@/hooks/use-realtime-posts";
import type { LatLng } from "@/lib/geo";
import { NEARBY_RADIUS_KM, haversineKm } from "@/lib/geo";

interface PostFeedProps {
  initialPosts: Post[];
  filters: Set<string>;
  userLocation?: LatLng | null;
}

const DATE_FILTERS = ["today", "tomorrow", "week"] as const;
const SKILL_FILTERS = ["beginner", "intermediate", "advanced"] as const;

type DateFilter = (typeof DATE_FILTERS)[number];
type SkillFilter = (typeof SKILL_FILTERS)[number];

function matchesDate(post: Post, filter: DateFilter): boolean {
  const today = new Date();
  const playDate = new Date(post.play_date);
  switch (filter) {
    case "today":
      return playDate.toDateString() === today.toDateString();
    case "tomorrow": {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return playDate.toDateString() === tomorrow.toDateString();
    }
    case "week": {
      const weekEnd = new Date(today);
      weekEnd.setDate(weekEnd.getDate() + 7);
      return playDate >= today && playDate <= weekEnd;
    }
  }
}

function matchesSkill(post: Post, filter: SkillFilter): boolean {
  return post.skill_level === filter || post.skill_level === "any";
}

function isWithinNearby(
  post: Post,
  userLocation: LatLng | null | undefined,
): boolean {
  if (!userLocation) return false;
  const lat = post.court_latitude;
  const lng = post.court_longitude;
  if (
    typeof lat !== "number" ||
    typeof lng !== "number" ||
    !Number.isFinite(lat) ||
    !Number.isFinite(lng)
  ) {
    return false;
  }
  return haversineKm(userLocation, { lat, lng }) <= NEARBY_RADIUS_KM;
}

export function PostFeed({ initialPosts, filters, userLocation }: PostFeedProps) {
  const seedKey = initialPosts.map((p) => p.id).join(",");
  return (
    <PostFeedInner
      key={seedKey}
      initialPosts={initialPosts}
      filters={filters}
      userLocation={userLocation}
    />
  );
}

function PostFeedInner({ initialPosts, filters, userLocation }: PostFeedProps) {
  const posts = useRealtimePosts(initialPosts);

  const dateFilter = DATE_FILTERS.find((f) => filters.has(f));
  const skillFilter = SKILL_FILTERS.find((f) => filters.has(f));
  const nearbyActive = filters.has("nearby");

  const filteredPosts = posts.filter((post) => {
    if (dateFilter && !matchesDate(post, dateFilter)) return false;
    if (skillFilter && !matchesSkill(post, skillFilter)) return false;
    if (nearbyActive && !isWithinNearby(post, userLocation)) return false;
    return true;
  });

  if (filteredPosts.length === 0) {
    return (
      <div className="text-center py-16 px-6">
        <span className="material-symbols-outlined text-outline-variant text-5xl mb-3">
          group_off
        </span>
        <h3 className="font-headline text-lg font-bold text-on-surface">
          No games found
        </h3>
        <p className="text-sm text-on-surface-variant mt-1">
          {nearbyActive && !userLocation
            ? "Enable location to see games near you."
            : "Try removing a filter or be the first to create a game!"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-5">
      {filteredPosts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
