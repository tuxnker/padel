import type { Metadata } from "next";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { fetchOpenPosts } from "@/lib/posts";
import { PlayClient } from "./play-client";

export const metadata: Metadata = {
  title: "Find Padel Players & Open Games in Ireland",
  description:
    "Join open padel games in Dublin, Cork, Galway and across Ireland — or post your own to find partners at your skill level.",
  alternates: { canonical: "/play" },
  openGraph: {
    title: "Find Padel Players & Open Games in Ireland",
    description:
      "Join open padel games across Ireland or post your own to find partners.",
  },
};

export default async function PlayPage({
  searchParams,
}: {
  searchParams: Promise<{ create?: string; court?: string }>;
}) {
  const { create, court } = await searchParams;
  const supabase = await createClient();
  const initialPosts = await fetchOpenPosts(supabase);

  return (
    <Suspense fallback={null}>
      <PlayClient
        initialPosts={initialPosts}
        openCreate={create === "true"}
        initialCourtSlug={court ?? null}
      />
    </Suspense>
  );
}
