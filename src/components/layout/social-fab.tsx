"use client";

import Link from "next/link";

export function SocialFab() {
  return (
    <Link
      href="/play?create=true"
      className="fixed right-6 bottom-28 z-40 w-14 h-14 rounded-full signature-gradient text-on-primary shadow-xl flex items-center justify-center active:scale-90 transition-all"
    >
      <span className="material-symbols-outlined text-3xl">add</span>
    </Link>
  );
}
