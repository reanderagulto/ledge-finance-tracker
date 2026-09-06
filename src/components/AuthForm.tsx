"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function AuthForm({
  mode,
  redirectTo = "/",
}: {
  mode: "login" | "register";
  redirectTo?: string;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          setError(error.message);
          return;
        }
        router.push(redirectTo);
        router.refresh();
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) {
          setError(error.message);
          return;
        }
        if (data.session) {
          // Email confirmation is disabled on this project — the user is signed in already.
          router.push(redirectTo);
          router.refresh();
        } else {
          setConfirmationSent(true);
        }
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmationSent) {
    return (
      <AuthShell>
        <h1 className="font-display text-xl">Check your inbox</h1>
        <p className="mt-2 text-sm text-ink-soft">
          We sent a confirmation link to <strong>{email}</strong>. Open it to
          activate your account, then come back and sign in.
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <h1 className="font-display text-xl">
        {mode === "login" ? "Welcome back" : "Create your ledger"}
      </h1>
      <p className="mt-1 text-sm text-ink-soft">
        {mode === "login"
          ? "Sign in to see your income and expenses."
          : "Set up an account to start tracking."}
      </p>

      {error && (
        <div className="mt-4 rounded-md border border-loss/30 bg-loss-soft px-3 py-2 text-sm text-loss">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label className="block text-sm text-ink-soft" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 outline-none focus:border-brass"
          />
        </div>

        <div>
          <label className="block text-sm text-ink-soft" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 outline-none focus:border-brass"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-brass py-2.5 text-sm font-medium text-white transition-opacity disabled:opacity-60"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === "login" ? "Sign in" : "Create account"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-ink-soft">
        {mode === "login" ? (
          <>
            New here?{" "}
            <a href="/register" className="font-medium text-brass">
              Create an account
            </a>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <a href="/login" className="font-medium text-brass">
              Sign in
            </a>
          </>
        )}
      </p>
    </AuthShell>
  );
}

function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-6">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-2.5">
          <BookOpen className="h-5 w-5 text-brass" strokeWidth={1.75} />
          <span className="font-display text-xl tracking-tight">Ledger</span>
        </div>
        <div className="rounded-lg border border-line bg-paper-raised p-6 shadow-card">
          {children}
        </div>
      </div>
    </div>
  );
}
