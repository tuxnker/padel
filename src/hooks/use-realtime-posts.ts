"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Post } from "@/types";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

export function useRealtimePosts(initialPosts: Post[]) {
  const [posts, setPosts] = useState(initialPosts);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let isMounted = true;
    queueMicrotask(() => {
      if (isMounted) {
        setPosts(initialPosts);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [initialPosts]);

  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel("posts-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "posts" },
        (payload: RealtimePostgresChangesPayload<Post>) => {
          if (payload.eventType === "INSERT") {
            setPosts((prev) => [payload.new as Post, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setPosts((prev) =>
              prev.map((p) =>
                p.id === (payload.new as Post).id
                  ? { ...p, ...(payload.new as Post) }
                  : p
              )
            );
          } else if (payload.eventType === "DELETE") {
            setPosts((prev) =>
              prev.filter((p) => p.id !== (payload.old as { id: string }).id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return posts;
}
