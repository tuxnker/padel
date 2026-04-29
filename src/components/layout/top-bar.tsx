"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/courts", label: "Courts" },
  { href: "/play", label: "Games" },
  { href: "/profile", label: "Profile" },
] as const;

export function TopBar() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-[#0B1220]/95 backdrop-blur border-b border-[#253149]">
      <div className="mx-auto flex max-w-screen-xl items-center justify-between px-5 sm:px-8 h-16 md:h-20">
        <Link
          href="/"
          aria-label="OM Player home"
          className="flex items-center gap-2 shrink-0"
        >
          <Image
            src="/brand/wordmark-header-v2.png"
            alt="OM Player"
            width={1160}
            height={390}
            priority
            className="brand-wordmark-image h-12 md:h-14 w-auto"
          />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => {
            const isActive =
              pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "font-label text-sm font-semibold tracking-wide transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-white/80 hover:text-primary"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <Link
          href="/play"
          className="hidden md:inline-flex items-center gap-1 rounded-full bg-primary px-5 py-2 font-label text-sm font-bold text-on-primary hover:bg-primary-dim transition-colors"
        >
          Find a Game
        </Link>
      </div>
    </header>
  );
}
