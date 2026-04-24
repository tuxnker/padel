"use client";

import Link from "next/link";

export function TopBar() {
  return (
    <header className="fixed top-0 w-full z-50 glass flex justify-between items-center px-6 h-16">
      <div className="flex items-center gap-4">
        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-low active:scale-95 transition-transform">
          <span className="material-symbols-outlined text-outline">
            search
          </span>
        </button>
        <Link href="/courts">
          <h1 className="font-headline tracking-tight text-xl font-extrabold text-primary italic">
            Padel Connect
          </h1>
        </Link>
      </div>
      <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-low active:scale-95 transition-transform">
        <span className="material-symbols-outlined text-primary">
          filter_list
        </span>
      </button>
    </header>
  );
}
