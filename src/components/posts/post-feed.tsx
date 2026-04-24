"use client";

import { PostCard } from "./post-card";
import type { Post } from "@/types";
import { useRealtimePosts } from "@/hooks/use-realtime-posts";

interface PostFeedProps {
  initialPosts: Post[];
  filter: string;
}

export function PostFeed({ initialPosts, filter }: PostFeedProps) {
  const posts = useRealtimePosts(initialPosts);

  const filteredPosts = posts.filter((post) => {
    if (!filter) return true;

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
      case "beginner":
      case "intermediate":
      case "advanced":
        return post.skill_level === filter || post.skill_level === "any";
      default:
        return true;
    }
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
          Be the first to create a game and find players!
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
