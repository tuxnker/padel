"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignOut = async () => {
    setPending(true);
    setError(null);

    try {
      const response = await fetch("/auth/sign-out", {
        method: "POST",
        credentials: "same-origin",
      });

      if (!response.ok) {
        throw new Error("Could not log out.");
      }

      router.replace("/login?next=%2Fprofile");
      router.refresh();
    } catch (signOutError) {
      setError(
        signOutError instanceof Error
          ? signOutError.message
          : "Could not log out.",
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleSignOut}
        disabled={pending}
        className="inline-flex items-center gap-2 font-headline text-sm font-bold text-error active:scale-95 transition-transform disabled:opacity-60"
      >
        <span className="material-symbols-outlined text-lg">logout</span>
        {pending ? "Logging out..." : "Logout"}
      </button>
      {error && (
        <p className="text-xs text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
