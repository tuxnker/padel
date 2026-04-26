import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { POST_WITH_RELATIONS_SELECT, flattenPostRow, type JoinedRow } from "@/lib/posts";
import type { Post } from "@/types";

interface ActivityListProps {
  userId: string;
}

export async function ActivityList({ userId }: ActivityListProps) {
  const supabase = await createClient();

  const [authoredRes, joinedRes] = await Promise.all([
    supabase
      .from("posts")
      .select(POST_WITH_RELATIONS_SELECT)
      .eq("author_id", userId)
      .order("play_date", { ascending: false })
      .limit(5),
    supabase
      .from("responses")
      .select(`post:posts!responses_post_id_fkey(${POST_WITH_RELATIONS_SELECT})`)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const authored: Post[] = (authoredRes.data ?? []).map((row) =>
    flattenPostRow(row as unknown as JoinedRow),
  );
  const joined: Post[] = ((joinedRes.data ?? []) as Array<{ post: unknown }>)
    .map((r) => r.post)
    .filter(Boolean)
    .map((row) => flattenPostRow(row as JoinedRow));

  if (authored.length === 0 && joined.length === 0) {
    return (
      <div className="px-5 space-y-4">
        <h2 className="font-headline text-xs font-bold uppercase tracking-wider text-on-surface-variant">
          My Activity
        </h2>
        <div className="text-center py-8 bg-surface-container-lowest rounded-2xl">
          <p className="text-sm text-on-surface-variant">
            Your games and activity will appear here.
          </p>
          <Link
            href="/play?create=true"
            className="mt-3 inline-flex items-center gap-1 font-headline text-sm font-bold text-primary"
          >
            Create your first game
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 space-y-4">
      <h2 className="font-headline text-xs font-bold uppercase tracking-wider text-on-surface-variant">
        My Activity
      </h2>
      {authored.map((p) => (
        <ActivityCard key={`a-${p.id}`} post={p} role="Posted" />
      ))}
      {joined.map((p) => (
        <ActivityCard key={`j-${p.id}`} post={p} role="Joined" />
      ))}
    </div>
  );
}

function ActivityCard({ post, role }: { post: Post; role: "Posted" | "Joined" }) {
  return (
    <div className="bg-surface-container-lowest rounded-2xl p-5 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-headline uppercase tracking-wider text-on-surface-variant">
          {role} · {post.play_date}
        </span>
        <span className="px-3 py-1 rounded-full bg-tertiary-container text-on-tertiary-container font-headline text-xs font-bold uppercase">
          {post.status}
        </span>
      </div>
      <p className="font-body text-sm text-on-surface">
        {post.message ?? `${post.players_needed} players needed`}
        {post.court_name ? ` · ${post.court_name}` : ""}
      </p>
    </div>
  );
}
