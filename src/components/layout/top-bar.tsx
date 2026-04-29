"use client";

import Link from "next/link";

export function TopBar() {
  return (
    <header className="fixed top-0 w-full z-50 glass flex justify-between items-center px-6 h-16">
      <Link href="/courts">
        <h1 className="font-headline tracking-tight text-xl font-extrabold text-primary italic">
          OM Player
        </h1>
      </Link>
    </header>
  );
}
