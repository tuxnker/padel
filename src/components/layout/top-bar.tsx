"use client";

import Link from "next/link";
import Image from "next/image";

export function TopBar() {
  return (
    <header className="fixed top-0 w-full z-50 glass flex justify-between items-center px-6 h-16">
      <Link href="/courts" aria-label="OM Player home">
        <Image
          src="/brand/wordmark-light.png"
          alt="OM Player"
          width={1774}
          height={887}
          priority
          className="brand-wordmark-image h-8 w-auto"
        />
        <span className="brand-wordmark-text font-headline tracking-tight text-xl font-extrabold text-primary italic">
          OM Player
        </span>
      </Link>
    </header>
  );
}
