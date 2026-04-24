"use client";

import { useAuth } from "@/hooks/use-auth";

export function SignOutButton() {
  const { signOut } = useAuth();
  return (
    <button
      onClick={signOut}
      className="inline-flex items-center gap-2 font-headline text-sm font-bold text-error"
    >
      <span className="material-symbols-outlined text-lg">logout</span>
      Logout
    </button>
  );
}
