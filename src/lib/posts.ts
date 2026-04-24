import type { SupabaseClient } from "@supabase/supabase-js";
import type { Post } from "@/types";

export const POST_WITH_RELATIONS_SELECT = `
  id,
  author_id,
  court_id,
  court_name_override,
  play_date,
  play_time,
  skill_level,
  players_needed,
  players_joined,
  message,
  status,
  created_at,
  author:users!posts_author_id_fkey ( name, skill_level, avatar_url ),
  court:courts!posts_court_id_fkey ( name, slug )
`;

type JoinedRow = {
  id: string;
  author_id: string;
  court_id: string | null;
  court_name_override: string | null;
  play_date: string;
  play_time: string;
  skill_level: Post["skill_level"];
  players_needed: number;
  players_joined: number;
  message: string | null;
  status: Post["status"];
  created_at: string;
  author: { name: string; skill_level: Post["author_skill_level"]; avatar_url: string | null } | null;
  court: { name: string; slug: string } | null;
};

export function flattenPostRow(row: JoinedRow): Post {
  return {
    id: row.id,
    author_id: row.author_id,
    court_id: row.court_id,
    court_name_override: row.court_name_override,
    play_date: row.play_date,
    play_time: row.play_time,
    skill_level: row.skill_level,
    players_needed: row.players_needed,
    players_joined: row.players_joined,
    message: row.message,
    status: row.status,
    created_at: row.created_at,
    author_name: row.author?.name,
    author_skill_level: row.author?.skill_level,
    author_avatar_url: row.author?.avatar_url ?? null,
    court_name: row.court?.name ?? row.court_name_override ?? undefined,
    court_slug: row.court?.slug,
  };
}

export async function fetchOpenPosts(
  supabase: SupabaseClient,
  limit = 50,
): Promise<Post[]> {
  const { data, error } = await supabase
    .from("posts")
    .select(POST_WITH_RELATIONS_SELECT)
    .in("status", ["open", "full"])
    .gte("play_date", new Date().toISOString().slice(0, 10))
    .order("play_date", { ascending: true })
    .order("play_time", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("fetchOpenPosts failed", error);
    return [];
  }
  return (data as unknown as JoinedRow[]).map(flattenPostRow);
}

export async function fetchPostById(
  supabase: SupabaseClient,
  id: string,
): Promise<Post | null> {
  const { data, error } = await supabase
    .from("posts")
    .select(POST_WITH_RELATIONS_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return flattenPostRow(data as unknown as JoinedRow);
}

export async function fetchPostsForCourt(
  supabase: SupabaseClient,
  courtId: string,
  limit = 10,
): Promise<Post[]> {
  const { data, error } = await supabase
    .from("posts")
    .select(POST_WITH_RELATIONS_SELECT)
    .eq("court_id", courtId)
    .eq("status", "open")
    .gte("play_date", new Date().toISOString().slice(0, 10))
    .order("play_date", { ascending: true })
    .order("play_time", { ascending: true })
    .limit(limit);
  if (error) {
    console.error("fetchPostsForCourt failed", error);
    return [];
  }
  return (data as unknown as JoinedRow[]).map(flattenPostRow);
}

export async function fetchCourtsForPicker(
  supabase: SupabaseClient,
): Promise<Array<{ id: string; name: string }>> {
  const { data, error } = await supabase
    .from("courts")
    .select("id, name")
    .eq("status", "open")
    .order("name", { ascending: true });
  if (error || !data) return [];
  return data as Array<{ id: string; name: string }>;
}
