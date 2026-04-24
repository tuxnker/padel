"use client";

import type { Post } from "@/types";
import { getInitials } from "@/lib/utils";
import Link from "next/link";

const skillBadgeStyles: Record<string, string> = {
  beginner: "bg-surface-variant text-on-surface-variant",
  intermediate: "bg-secondary-container text-on-secondary-container",
  advanced: "bg-tertiary-container text-on-tertiary-container",
  any: "bg-surface-container-highest text-on-surface-variant",
};

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const spotsLeft = post.players_needed - post.players_joined;
  const authorName = post.author_name || "Anonymous";
  const initials = getInitials(authorName);
  const skillLevel = post.author_skill_level || post.skill_level;

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {post.author_avatar_url ? (
            <img
              src={post.author_avatar_url}
              alt={authorName}
              className="w-11 h-11 rounded-full object-cover"
            />
          ) : (
            <div className="w-11 h-11 rounded-full signature-gradient flex items-center justify-center">
              <span className="font-headline text-sm font-bold text-on-primary">
                {initials}
              </span>
            </div>
          )}
          <div>
            <h3 className="font-headline text-base font-bold text-on-surface">
              {authorName}
            </h3>
            <p className="text-xs text-on-surface-variant">
              {formatTimeAgo(post.created_at)}
            </p>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full font-headline text-xs font-bold uppercase tracking-wider ${skillBadgeStyles[skillLevel] || skillBadgeStyles.any}`}
        >
          {skillLevel}
        </span>
      </div>

      {/* Message */}
      {post.message && (
        <p className="font-body text-base text-on-surface leading-relaxed">
          {highlightVenue(post.message, post.court_name)}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1 text-on-surface-variant">
          <span className="material-symbols-outlined text-lg">group</span>
          <span className="font-headline text-sm font-semibold">
            {spotsLeft} spot{spotsLeft !== 1 ? "s" : ""} left
          </span>
        </div>
        <button className="px-6 py-2.5 rounded-full bg-primary text-on-primary font-headline text-sm font-bold uppercase tracking-wider active:scale-95 transition-transform">
          I&apos;m in
        </button>
      </div>
    </div>
  );
}

function formatTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} mins ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  return `${diffDays}d ago`;
}

function highlightVenue(
  message: string,
  courtName?: string
): React.ReactNode {
  if (!courtName) return message;
  const parts = message.split(new RegExp(`(${courtName})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === courtName.toLowerCase() ? (
      <Link
        key={i}
        href="#"
        className="font-bold text-primary"
      >
        {part}
      </Link>
    ) : (
      part
    )
  );
}
