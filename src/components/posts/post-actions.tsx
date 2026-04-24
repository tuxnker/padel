"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { isJoinedByUser, joinPost, leavePost } from "@/lib/posts";
import type { Post } from "@/types";

interface PostActionsProps {
  post: Post;
}

export function PostActions({ post }: PostActionsProps) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  const [joined, setJoined] = useState(false);
  const [busy, setBusy] = useState(false);

  const spotsLeft = Math.max(post.players_needed - post.players_joined, 0);
  const isAuthor = user?.id === post.author_id;
  const isFull = post.status === "full" || spotsLeft <= 0;

  useEffect(() => {
    if (!user || !supabase) return;
    let cancelled = false;
    isJoinedByUser(supabase, post.id, user.id).then((v) => {
      if (!cancelled) setJoined(v);
    });
    return () => { cancelled = true; };
  }, [user, supabase, post.id]);

  if (loading) return null;

  if (!user) {
    return (
      <button
        onClick={() => router.push(`/login?next=${encodeURIComponent("/play")}`)}
        className="px-6 py-2.5 rounded-full bg-primary text-on-primary font-headline text-sm font-bold uppercase tracking-wider active:scale-95 transition-transform"
      >
        Sign in to join
      </button>
    );
  }

  if (isAuthor) {
    return (
      <span className="font-headline text-xs font-bold uppercase tracking-wider text-on-surface-variant">
        Your post
      </span>
    );
  }

  const onClick = async () => {
    if (!supabase || busy) return;
    setBusy(true);
    const { error } = joined
      ? await leavePost(supabase, post.id, user.id)
      : await joinPost(supabase, post.id, user.id);
    setBusy(false);
    if (!error) {
      setJoined((v) => !v);
      router.refresh();
    }
  };

  const disabled = busy || (!joined && isFull);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-6 py-2.5 rounded-full bg-primary text-on-primary font-headline text-sm font-bold uppercase tracking-wider active:scale-95 transition-transform disabled:opacity-60"
    >
      {joined ? "Leave" : isFull ? "Full" : "I'm in"}
    </button>
  );
}
