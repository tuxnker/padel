"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { fetchPostById } from "@/lib/posts";
import type { Post } from "@/types";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

export function useRealtimePosts(initialPosts: Post[]) {
  const [posts, setPosts] = useState(initialPosts);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts]);

  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel("posts-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "posts" },
        async (payload: RealtimePostgresChangesPayload<Post>) => {
          if (payload.eventType === "INSERT") {
            const full = await fetchPostById(supabase, (payload.new as Post).id);
            if (full) setPosts((prev) => [full, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            // payload.new is the raw row (no joins). Merge only mutable scalars
            // so we don't clobber joined fields like author_name / court_slug.
            const next = payload.new as Post;
            setPosts((prev) =>
              prev.map((p) =>
                p.id === next.id
                  ? {
                      ...p,
                      status: next.status,
                      players_joined: next.players_joined,
                      players_needed: next.players_needed,
                      message: next.message,
                    }
                  : p,
              ),
            );
          } else if (payload.eventType === "DELETE") {
            setPosts((prev) =>
              prev.filter((p) => p.id !== (payload.old as { id: string }).id),
            );
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return posts;
}
