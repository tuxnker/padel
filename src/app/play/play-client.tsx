"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { PostFeed } from "@/components/posts/post-feed";
import { PostFilters } from "@/components/posts/post-filters";
import { CreatePostDialog } from "@/components/posts/create-post-dialog";
import type { Post } from "@/types";
import { useUserLocation } from "@/hooks/use-user-location";

interface PlayClientProps {
  initialPosts: Post[];
  openCreate: boolean;
  initialCourtSlug: string | null;
}

export function PlayClient({
  initialPosts,
  openCreate,
  initialCourtSlug,
}: PlayClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  const [activeFilters, setActiveFilters] = useState<Set<string>>(
    () => new Set(),
  );
  const { location, status, requestLocation } = useUserLocation();

  const handleClose = () => {
    startTransition(() => {
      router.replace(pathname, { scroll: false });
    });
  };

  return (
    <div className="space-y-4 pb-8">
      <PostFilters
        activeFilters={activeFilters}
        onChange={setActiveFilters}
        locationStatus={status}
        onRequestLocation={() => {
          void requestLocation();
        }}
      />
      <div className="px-5">
        <p className="font-headline text-xs font-bold uppercase tracking-wider text-primary mb-1">
          Live Feed
        </p>
        <h1 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight">
          Find your match
        </h1>
      </div>
      <PostFeed
        initialPosts={initialPosts}
        filters={activeFilters}
        userLocation={location}
      />
      <CreatePostDialog
        open={openCreate}
        onClose={handleClose}
        initialCourtSlug={initialCourtSlug}
        userLocation={location}
        onRequestLocation={() => {
          void requestLocation();
        }}
        locationStatus={status}
      />
    </div>
  );
}
