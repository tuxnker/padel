import { Suspense } from "react";
import Image from "next/image";
import { LoginForm } from "@/components/auth/login-form";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to OM Player to find one more player and join open games.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/login" },
};

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-6rem)] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center space-y-3">
          <Image
            src="/brand/wordmark-light.png"
            alt="OM Player"
            width={1774}
            height={887}
            priority
            className="brand-wordmark-image mx-auto h-20 w-auto"
          />
          <div className="brand-wordmark-text justify-center">
            <div className="w-20 h-20 mx-auto rounded-full signature-gradient flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-on-primary text-4xl">
                sports_tennis
              </span>
            </div>
          </div>
          <h1 className="brand-wordmark-text font-headline text-3xl font-extrabold text-primary italic justify-center">
            OM Player
          </h1>
          <p className="text-sm text-on-surface-variant">
            Sign in to find one more player
          </p>
        </div>

        {/* Form */}
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>

        {/* Footer */}
        <p className="text-xs text-center text-on-surface-variant">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
