"use client";

import { Suspense, useState, useEffect, useMemo } from "react";
import { PostFeed } from "@/components/posts/post-feed";
import { PostFilters } from "@/components/posts/post-filters";
import { CreatePostDialog } from "@/components/posts/create-post-dialog";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Post } from "@/types";

function PlayPageContent() {
  const searchParams = useSearchParams();
  const [activeFilter, setActiveFilter] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(
    searchParams.get("create") === "true"
  );
  const [posts, setPosts] = useState<Post[]>([]);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    if (!supabase) return;

    let isMounted = true;

    async function loadPosts() {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (isMounted && !error && data) {
        setPosts(data as Post[]);
      }
    }

    loadPosts();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  return (
    <div className="space-y-4 pb-8">
      {/* Filters */}
      <PostFilters
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      {/* Header */}
      <div className="px-5">
        <p className="font-headline text-xs font-bold uppercase tracking-wider text-primary mb-1">
          Live Feed
        </p>
        <h1 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight">
          Find your match
        </h1>
      </div>

      {/* Feed */}
      <PostFeed initialPosts={posts} filter={activeFilter} />

      {/* Create dialog */}
      <CreatePostDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
      />
    </div>
  );
}

export default function PlayPage() {
  return (
    <Suspense fallback={null}>
      <PlayPageContent />
    </Suspense>
  );
}
