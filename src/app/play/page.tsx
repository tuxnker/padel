import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { fetchOpenPosts } from "@/lib/posts";
import { PlayClient } from "./play-client";

export default async function PlayPage({
  searchParams,
}: {
  searchParams: Promise<{ create?: string }>;
}) {
  const { create } = await searchParams;
  const supabase = await createClient();
  const initialPosts = await fetchOpenPosts(supabase);

  return (
    <Suspense fallback={null}>
      <PlayClient initialPosts={initialPosts} openCreate={create === "true"} />
    </Suspense>
  );
}
