"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";
import StrengthMeter from "@/components/StrengthMeter";

const OAUTH_ERRORS = {
  OAuthSignin: "Couldn't start Google sign-in. Check the Google client settings in .env.local.",
  OAuthCallback: "Google sign-in failed. Try again.",
  AccessDenied: "That Google account isn't allowed to sign in.",
  SessionRequired: "Please log in to continue.",
};

// One component for both /login and /signup, since they share the layout,
// the Google button and the sign-in step at the end.
export default function AuthForm({ mode, googleEnabled, initialError }) {
  const router = useRouter();
  const isSignup = mode === "signup";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(
    initialError ? OAUTH_ERRORS[initialError] ?? "Sign-in failed. Try again." : ""
  );
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (isSignup && password !== confirmPassword) {
      setError("The passwords don't match.");
      return;
    }

    setBusy(true);

    try {
      if (isSignup) {
        const response = await fetch("/api/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await response.json();
        if (!response.ok) {
          setError(data.message);
          setBusy(false);
          return;
        }
      }

      const result = await signIn("credentials", { email, password, redirect: false });

      if (!result?.ok) {
        setError("Wrong email or password.");
        setBusy(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-black px-4 py-12 text-white">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-lg">
        <div className="text-center">
          <Link href="/" className="text-2xl font-bold text-cyan-400">
            🔐 PassVault
          </Link>
          <h1 className="mt-4 text-3xl font-bold">{isSignup ? "Create your vault" : "Login"}</h1>
        </div>

        {googleEnabled && (
          <>
            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-5 py-3 font-semibold text-slate-900 transition hover:bg-slate-200"
            >
              <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
                <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
                <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
              </svg>
              Continue with Google
            </button>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <div className="h-px flex-1 bg-slate-700" />
              or with email
              <div className="h-px flex-1 bg-slate-700" />
            </div>
          </>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <input
              className="field"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
            />
          )}

          <input
            className="field"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          <input
            className="field"
            type="password"
            placeholder={isSignup ? "Master password" : "Password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={isSignup ? "new-password" : "current-password"}
            required
          />

          {isSignup && (
            <>
              <StrengthMeter password={password} />
              <input
                className="field"
                type="password"
                placeholder="Confirm master password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </>
          )}

          {error && <p className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}

          <button type="submit" disabled={busy} className="btn-primary w-full">
            {busy ? "Please wait..." : isSignup ? "Create account" : "Login"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400">
          {isSignup ? "Already have an account? " : "New here? "}
          <Link href={isSignup ? "/login" : "/signup"} className="font-semibold text-cyan-400 hover:underline">
            {isSignup ? "Login" : "Sign up"}
          </Link>
        </p>
      </div>
    </main>
  );
}
