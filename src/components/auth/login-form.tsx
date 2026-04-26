"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "";
  const callbackUrl = (origin: string) => {
    const url = new URL("/auth/callback", origin);
    if (next) url.searchParams.set("next", next);
    return url.toString();
  };

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const handleGoogleLogin = async () => {
    if (!supabase) {
      setError("Supabase is not configured yet.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl(window.location.origin),
      },
    });
    if (error) setError(error.message);
    setLoading(false);
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setError("Supabase is not configured yet.");
      return;
    }
    if (!email) return;
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: callbackUrl(window.location.origin),
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setMagicLinkSent(true);
    }
    setLoading(false);
  };

  if (magicLinkSent) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-primary-container flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-3xl">
            mail
          </span>
        </div>
        <h2 className="font-headline text-xl font-bold text-on-surface">
          Check your email
        </h2>
        <p className="text-sm text-on-surface-variant">
          We sent a magic link to <strong>{email}</strong>
        </p>
        <button
          onClick={() => setMagicLinkSent(false)}
          className="text-sm font-headline font-bold text-secondary"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-error-container/10 text-error rounded-xl p-3 text-sm text-center">
          {error}
        </div>
      )}

      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full h-12 rounded-2xl signature-gradient text-on-primary font-headline font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-3 active:scale-[0.98] transition-transform disabled:opacity-50"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Continue with Google
      </button>

      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-outline-variant/20" />
        <span className="text-xs text-on-surface-variant font-headline uppercase tracking-wider">
          or
        </span>
        <div className="flex-1 h-px bg-outline-variant/20" />
      </div>

      <form onSubmit={handleMagicLink} className="space-y-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="w-full h-12 px-4 rounded-xl bg-surface-container-lowest text-on-surface font-body text-sm placeholder:text-outline-variant focus:outline-none focus:ring-2 focus:ring-primary/20"
          required
        />
        <button
          type="submit"
          disabled={loading || !email}
          className="w-full h-12 rounded-2xl bg-secondary-container text-on-secondary-container font-headline font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-lg">magic_button</span>
          Send Magic Link
        </button>
      </form>
    </div>
  );
}
