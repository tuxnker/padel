import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Sign In",
  description: "Sign in to Padel Connect to find players and join games.",
};

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-6rem)] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="w-20 h-20 mx-auto rounded-full signature-gradient flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-on-primary text-4xl">
              sports_tennis
            </span>
          </div>
          <h1 className="font-headline text-3xl font-extrabold text-primary italic">
            Padel Connect
          </h1>
          <p className="text-sm text-on-surface-variant">
            Sign in to find players and join games
          </p>
        </div>

        {/* Form */}
        <LoginForm />

        {/* Footer */}
        <p className="text-xs text-center text-on-surface-variant">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
