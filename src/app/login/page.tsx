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
            src="/brand/wordmark-header-v2.png"
            alt="OM Player"
            width={1160}
            height={390}
            priority
            className="mx-auto h-16 w-auto"
          />
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
