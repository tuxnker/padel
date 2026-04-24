"use client";

import { useState } from "react";
import { PostFeed } from "@/components/posts/post-feed";
import { PostFilters } from "@/components/posts/post-filters";
import { CreatePostDialog } from "@/components/posts/create-post-dialog";
import type { Post } from "@/types";

interface PlayClientProps {
  initialPosts: Post[];
  openCreate: boolean;
}

export function PlayClient({ initialPosts, openCreate }: PlayClientProps) {
  const [activeFilter, setActiveFilter] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(openCreate);

  return (
    <div className="space-y-4 pb-8">
      <PostFilters activeFilter={activeFilter} onFilterChange={setActiveFilter} />
      <div className="px-5">
        <p className="font-headline text-xs font-bold uppercase tracking-wider text-primary mb-1">
          Live Feed
        </p>
        <h1 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight">
          Find your match
        </h1>
      </div>
      <PostFeed initialPosts={initialPosts} filter={activeFilter} />
      <CreatePostDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
      />
    </div>
  );
}
