"use client";

import { Suspense, useState, useEffect, FormEvent } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";

type AuthMode = "login" | "signup";
type Role = "storer" | "host" | "both";

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  terms?: string;
  general?: string;
}

function validateEmail(email: string): string | undefined {
  if (!email) return "Email is required";
  if (!email.endsWith("@st-andrews.ac.uk")) {
    return "Please use your University of St Andrews email (@st-andrews.ac.uk)";
  }
  return undefined;
}

function validatePassword(password: string): string | undefined {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  return undefined;
}

const URL_ERROR_MESSAGES: Record<string, string> = {
  confirmation_failed:
    "Email confirmation failed or the link has expired. Please sign up again.",
  callback_failed:
    "We couldn't verify your email. Please try again or sign up with a new account.",
};

export default function AuthPage() {
  return (
    <Suspense>
      <AuthPageInner />
    </Suspense>
  );
}

function AuthPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const hasRoleParams =
    searchParams.has("role_storer") || searchParams.has("role_host");
  const [mode, setMode] = useState<AuthMode>(
    hasRoleParams ? "signup" : "login"
  );
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  const [confirmedBanner, setConfirmedBanner] = useState(false);

  useEffect(() => {
    const urlError = searchParams.get("error");
    if (urlError && URL_ERROR_MESSAGES[urlError]) {
      setErrors({ general: URL_ERROR_MESSAGES[urlError] });
    }
    if (searchParams.get("confirmed") === "true") {
      setConfirmedBanner(true);
    }
  }, [searchParams]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  function deriveRoleFromParams(): Role | "" {
    const rs = searchParams.get("role_storer");
    const rh = searchParams.get("role_host");
    if (rs === null && rh === null) return "";
    const isStorer = rs === "true";
    const isHost = rh === "true";
    if (isStorer && isHost) return "both";
    if (isStorer) return "storer";
    if (isHost) return "host";
    return "";
  }

  const [role, setRole] = useState<Role | "">(deriveRoleFromParams);

  function resetForm() {
    setName("");
    setEmail("");
    setPassword("");
    setRole("");
    setTermsAccepted(false);
    setErrors({});
    setSuccessMessage(null);
  }

  function switchMode(newMode: AuthMode) {
    resetForm();
    setMode(newMode);
  }

  async function handleSignUp(e: FormEvent) {
    e.preventDefault();
    const newErrors: FormErrors = {};

    if (!name.trim()) newErrors.name = "Full name is required";
    const emailErr = validateEmail(email);
    if (emailErr) newErrors.email = emailErr;
    const passwordErr = validatePassword(password);
    if (passwordErr) newErrors.password = passwordErr;
    if (!role) newErrors.role = "Please select a role";
    if (!termsAccepted)
      newErrors.terms = "You must accept the Terms of Service";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name.trim(),
          role_storer: role === "storer" || role === "both",
          role_host: role === "host" || role === "both",
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (error) {
      setErrors({ general: error.message });
      return;
    }

    setSuccessMessage(
      "Check your email for a verification link. Please verify your St Andrews email to continue."
    );
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    const newErrors: FormErrors = {};

    const emailErr = validateEmail(email);
    if (emailErr) newErrors.email = emailErr;
    if (!password) newErrors.password = "Password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setErrors({ general: "Invalid email or password. Please try again." });
      return;
    }

    router.push("/dashboard/storer");
    router.refresh();
  }

  if (successMessage) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
          <h1 className="text-center text-2xl font-bold text-primary">
            Space4It
          </h1>
          <div className="mt-6 rounded-lg bg-accent/10 p-4 text-center">
            <svg
              className="mx-auto h-12 w-12 text-accent"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
              />
            </svg>
            <p className="mt-3 text-sm font-medium text-primary">
              {successMessage}
            </p>
          </div>
          <button
            onClick={() => switchMode("login")}
            className="mt-6 w-full text-center text-sm font-medium text-accent hover:underline"
          >
            Back to Login
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-center text-2xl font-bold text-primary">
          Space4It
        </h1>
        <p className="mt-1 text-center text-sm text-primary/60">
          Student storage, simplified
        </p>

        {/* Mode toggle */}
        <div className="mt-6 flex rounded-lg bg-background p-1">
          <button
            type="button"
            onClick={() => switchMode("login")}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${
              mode === "login"
                ? "bg-white text-primary shadow-sm"
                : "text-primary/50 hover:text-primary/70"
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => switchMode("signup")}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${
              mode === "signup"
                ? "bg-white text-primary shadow-sm"
                : "text-primary/50 hover:text-primary/70"
            }`}
          >
            Sign Up
          </button>
        </div>

        {confirmedBanner && (
          <div className="mt-4 rounded-lg bg-accent/10 px-4 py-3 text-sm text-accent">
            <span className="font-semibold">Email confirmed!</span> Please log in to continue.
          </div>
        )}

        {errors.general && (
          <div className="mt-4 rounded-lg bg-action/10 px-4 py-3 text-sm text-action">
            {errors.general}
          </div>
        )}

        {mode === "login" ? (
          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="login-email"
                className="block text-sm font-medium text-primary"
              >
                Email
              </label>
              <input
                id="login-email"
                type="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@st-andrews.ac.uk"
                className={`mt-1 w-full rounded-lg border px-4 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-primary/30 focus:border-accent focus:ring-1 focus:ring-accent ${
                  errors.email ? "border-action" : "border-primary/20"
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-action">{errors.email}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-sm font-medium text-primary"
              >
                Password
              </label>
              <input
                id="login-password"
                type="password"
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className={`mt-1 w-full rounded-lg border px-4 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-primary/30 focus:border-accent focus:ring-1 focus:ring-accent ${
                  errors.password ? "border-action" : "border-primary/20"
                }`}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-action">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-lg bg-action py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {loading ? (
                <svg
                  className="h-5 w-5 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              ) : (
                "Log In"
              )}
            </button>

            <p className="text-center text-xs text-primary/50">
              <button
                type="button"
                className="font-medium text-accent hover:underline"
              >
                Forgot password?
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleSignUp} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="signup-name"
                className="block text-sm font-medium text-primary"
              >
                Full Name
              </label>
              <input
                id="signup-name"
                type="text"
                name="name"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className={`mt-1 w-full rounded-lg border px-4 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-primary/30 focus:border-accent focus:ring-1 focus:ring-accent ${
                  errors.name ? "border-action" : "border-primary/20"
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-action">{errors.name}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="signup-email"
                className="block text-sm font-medium text-primary"
              >
                Email
              </label>
              <input
                id="signup-email"
                type="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@st-andrews.ac.uk"
                className={`mt-1 w-full rounded-lg border px-4 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-primary/30 focus:border-accent focus:ring-1 focus:ring-accent ${
                  errors.email ? "border-action" : "border-primary/20"
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-action">{errors.email}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="signup-password"
                className="block text-sm font-medium text-primary"
              >
                Password
              </label>
              <input
                id="signup-password"
                type="password"
                name="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className={`mt-1 w-full rounded-lg border px-4 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-primary/30 focus:border-accent focus:ring-1 focus:ring-accent ${
                  errors.password ? "border-action" : "border-primary/20"
                }`}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-action">{errors.password}</p>
              )}
            </div>

            <fieldset>
              <legend className="block text-sm font-medium text-primary">
                I want to...
              </legend>
              <div className="mt-2 space-y-2">
                {([
                  { value: "storer", label: "Store my stuff" },
                  { value: "host", label: "Host storage" },
                  { value: "both", label: "Both" },
                ] as const).map((opt) => (
                  <label
                    key={opt.value}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-primary/10 px-4 py-2.5 transition-colors hover:bg-background has-[:checked]:border-accent has-[:checked]:bg-accent/5"
                  >
                    <input
                      type="radio"
                      name="role"
                      value={opt.value}
                      checked={role === opt.value}
                      onChange={() => setRole(opt.value)}
                      className="h-4 w-4 accent-accent"
                    />
                    <span className="text-sm text-primary">{opt.label}</span>
                  </label>
                ))}
              </div>
              {errors.role && (
                <p className="mt-1 text-xs text-action">{errors.role}</p>
              )}
            </fieldset>

            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded accent-accent"
              />
              <span className="text-xs text-primary/70">
                I accept the{" "}
                <span className="font-medium text-accent">
                  Terms of Service
                </span>{" "}
                and{" "}
                <span className="font-medium text-accent">Privacy Policy</span>
              </span>
            </label>
            {errors.terms && (
              <p className="text-xs text-action">{errors.terms}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-lg bg-action py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {loading ? (
                <svg
                  className="h-5 w-5 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              ) : (
                "Create Account"
              )}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
